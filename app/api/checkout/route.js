import { NextResponse } from "next/server";
import { getBikeBySlug } from "@/lib/bikes";
import { installmentInfo } from "@/lib/bike-constants";
import {
  MAX_ONLINE_INSTALLMENTS,
  isValidCardNumber,
  isValidCpf,
  isValidEmail,
  onlyDigits,
} from "@/lib/order-constants";
import { applyPaymentResult, orderCode, reserveBikeAndCreateOrder } from "@/lib/orders";
import { chargeCreditCard, isRedeConfigured } from "@/lib/rede";

export const dynamic = "force-dynamic";

// Limite de tentativas por IP (em memória): trava quem tenta "testar" cartões
// em sequência. 6 tentativas a cada 10 minutos é folgado para um cliente real.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const attempts = new Map();

function tooManyAttempts(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) {
    for (const [key, list] of attempts) {
      if (list.every((t) => now - t >= WINDOW_MS)) attempts.delete(key);
    }
  }
  return false;
}

function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "") || request.headers.get("x-real-ip") || "desconhecido";
}

const str = (v, max) => String(v ?? "").trim().slice(0, max);

function validate(data, maxInstallments) {
  const customer = {
    name: str(data.customer?.name, 120),
    cpf: onlyDigits(data.customer?.cpf),
    email: str(data.customer?.email, 120).toLowerCase(),
    phone: onlyDigits(data.customer?.phone),
  };
  const address = {
    cep: onlyDigits(data.address?.cep),
    street: str(data.address?.street, 120),
    number: str(data.address?.number, 20),
    complement: str(data.address?.complement, 80),
    district: str(data.address?.district, 80),
    city: str(data.address?.city, 80),
    state: str(data.address?.state, 2).toUpperCase(),
  };

  const rawYear = onlyDigits(data.card?.year);
  const card = {
    number: onlyDigits(data.card?.number),
    cvv: onlyDigits(data.card?.cvv),
    month: onlyDigits(data.card?.month),
    year: rawYear.length === 2 ? `20${rawYear}` : rawYear,
    holder: str(data.card?.holder, 40)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toUpperCase(),
  };
  const installments = Math.round(Number(data.installments) || 1);

  if (customer.name.length < 5 || !customer.name.includes(" ")) return { error: "Informe o nome completo." };
  if (!isValidCpf(customer.cpf)) return { error: "CPF inválido." };
  if (!isValidEmail(customer.email)) return { error: "E-mail inválido." };
  if (customer.phone.length < 10 || customer.phone.length > 11) return { error: "Telefone inválido. Use DDD + número." };
  if (address.cep.length !== 8) return { error: "CEP inválido." };
  if (!address.street || !address.number || !address.district || !address.city || address.state.length !== 2) {
    return { error: "Preencha o endereço de entrega completo." };
  }
  if (!isValidCardNumber(card.number)) return { error: "Número do cartão inválido." };
  if (card.cvv.length < 3 || card.cvv.length > 4) return { error: "Código de segurança inválido." };
  const month = Number(card.month);
  const year = Number(card.year);
  const now = new Date();
  if (!(month >= 1 && month <= 12) || card.year.length !== 4) return { error: "Validade do cartão inválida." };
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
    return { error: "Cartão vencido." };
  }
  if (card.holder.length < 3) return { error: "Informe o nome impresso no cartão." };
  if (installments < 1 || installments > maxInstallments) return { error: "Número de parcelas inválido." };

  return { customer, address, card, installments };
}

export async function POST(request) {
  if (!isRedeConfigured()) {
    return NextResponse.json(
      { error: "O pagamento online está indisponível no momento. Fale com a gente pelo WhatsApp." },
      { status: 503 }
    );
  }

  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const bike = getBikeBySlug(str(data.slug, 200));
  if (!bike || bike.status === "oculta") {
    return NextResponse.json({ error: "Bicicleta não encontrada." }, { status: 404 });
  }
  if ((bike.condition || "nova") !== "seminova") {
    return NextResponse.json({ error: "Esta bike é vendida somente na loja." }, { status: 400 });
  }

  const maxInstallments = Math.min(installmentInfo(bike).count, MAX_ONLINE_INSTALLMENTS);
  const valid = validate(data, maxInstallments);
  if (valid.error) return NextResponse.json({ error: valid.error }, { status: 400 });

  if (tooManyAttempts(clientIp(request))) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos ou fale com a gente pelo WhatsApp." },
      { status: 429 }
    );
  }

  // O valor vem sempre do catálogo (nunca do navegador).
  const reserved = reserveBikeAndCreateOrder({
    bikeId: bike.id,
    customer: valid.customer,
    address: valid.address,
    installments: valid.installments,
  });
  if (reserved.error) {
    return NextResponse.json({ error: reserved.error }, { status: 409 });
  }
  const { order } = reserved;

  const result = await chargeCreditCard({
    reference: orderCode(order),
    amountCents: order.amountCents,
    installments: order.installments,
    card: valid.card,
  });

  const last4 = valid.card.number.slice(-4);
  const payment = { ...result.payment, cardLast4: last4 };

  if (result.outcome === "approved") {
    applyPaymentResult(order.id, { outcome: "approved", payment, message: "Pagamento aprovado no cartão." });
    return NextResponse.json({ ok: true, status: "pago", token: order.token });
  }

  if (result.outcome === "declined") {
    applyPaymentResult(order.id, {
      outcome: "declined",
      payment,
      message: result.configError
        ? "Pagamento não processado: credenciais da Rede inválidas. Confira REDE_PV e REDE_TOKEN."
        : `Pagamento recusado${payment.returnMessage ? `: ${payment.returnMessage}` : "."}`,
    });
    return NextResponse.json(
      {
        error: result.configError
          ? "O pagamento online está indisponível no momento. Fale com a gente pelo WhatsApp."
          : "O pagamento não foi autorizado. Confira os dados do cartão ou tente outro cartão.",
      },
      { status: result.configError ? 503 : 402 }
    );
  }

  applyPaymentResult(order.id, {
    outcome: "unknown",
    payment,
    message: "A Rede não respondeu. Confirme no portal da Rede se o cartão foi cobrado.",
  });
  return NextResponse.json({ ok: true, status: "verificando", token: order.token });
}
