import {
  isValidCardNumber,
  isValidCpf,
  isValidEmail,
  onlyDigits,
} from "./order-constants";
import { readStore } from "./db";
import { applyPaymentResult, getOrderById, orderCode } from "./orders";
import { chargeCreditCard, findTransactionByReference, isThreeDSEnabled } from "./rede";

// Pedaços comuns ao checkout das bikes e ao pagamento por link.

// Limite de tentativas por IP (em memória): trava quem tenta "testar" cartões
// em sequência. 6 tentativas a cada 10 minutos é folgado para um cliente real.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const attempts = new Map();

export function tooManyAttempts(ip) {
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

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "") || request.headers.get("x-real-ip") || "desconhecido";
}

// Endereço público do site, usado no link do pedido enviado por WhatsApp.
export function requestOrigin(request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
}

export const str = (v, max) => String(v ?? "").trim().slice(0, max);

export function validate(data, { maxInstallments, requireAddress = true }) {
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
  if (requireAddress) {
    if (address.cep.length !== 8) return { error: "CEP inválido." };
    if (!address.street || !address.number || !address.district || !address.city || address.state.length !== 2) {
      return { error: "Preencha o endereço de entrega completo." };
    }
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

// Cobra o pedido já criado/reservado e devolve { status, body } para a rota.
// browser: { device, userAgent } do navegador do cliente (para o 3DS).
export async function chargeOrder(order, card, browser = {}) {
  const base = String(order.siteUrl || "").replace(/\/+$/, "");
  const returnUrl = `${base}/api/rede/retorno?pedido=${encodeURIComponent(order.token)}`;
  const result = await chargeCreditCard({
    reference: orderCode(order),
    amountCents: order.amountCents,
    installments: order.installments,
    card,
    threeDS:
      isThreeDSEnabled() && base
        ? { device: browser.device, userAgent: browser.userAgent, successUrl: returnUrl, failureUrl: returnUrl }
        : undefined,
  });

  if (result.outcome === "authenticate") {
    applyPaymentResult(order.id, {
      outcome: "pending",
      payment: { ...result.payment, cardLast4: card.number.slice(-4), threeDS: true },
    });
    return {
      status: 200,
      body: { ok: true, status: "autenticar", redirectUrl: result.redirectUrl, token: order.token },
    };
  }

  const payment = { ...result.payment, cardLast4: card.number.slice(-4) };

  if (result.outcome === "approved") {
    applyPaymentResult(order.id, { outcome: "approved", payment, message: "Pagamento aprovado no cartão." });
    return { status: 200, body: { ok: true, status: "pago", token: order.token } };
  }

  if (result.outcome === "declined") {
    applyPaymentResult(order.id, {
      outcome: "declined",
      payment,
      message: result.configError
        ? `Pagamento não processado — ${result.detail || "credenciais da Rede inválidas"}. Confira REDE_PV, REDE_TOKEN e REDE_ENV.`
        : `Pagamento recusado${payment.returnMessage ? `: ${payment.returnMessage}` : "."}`,
    });
    return {
      status: result.configError ? 503 : 402,
      body: {
        error: result.configError
          ? "O pagamento online está indisponível no momento. Fale com a gente pelo WhatsApp."
          : "O pagamento não foi autorizado. Confira os dados do cartão ou tente outro cartão.",
      },
    };
  }

  applyPaymentResult(order.id, {
    outcome: "unknown",
    payment,
    message: "A Rede não respondeu. Confirme no portal da Rede se o cartão foi cobrado.",
  });
  return { status: 200, body: { ok: true, status: "verificando", token: order.token } };
}

// Pedido esperando o cliente autenticar no banco (3DS): consulta a Rede e
// fecha o pedido como pago ou recusado. `expire` trata uma autenticação
// pendente há muito tempo como abandonada (nenhuma cobrança foi feita).
export async function resolvePendingOrder(orderId, { expire = false } = {}) {
  const order = getOrderById(orderId);
  if (!order || order.status !== "aguardando_pagamento") return order;

  const found = await findTransactionByReference(orderCode(order));
  if (found.error) return order;

  if (found.found && found.approved) {
    applyPaymentResult(order.id, {
      outcome: "approved",
      payment: found.payment,
      message: "Pagamento aprovado (autenticado no banco).",
    });
  } else if (found.found && found.pending && !expire) {
    return getOrderById(orderId);
  } else {
    applyPaymentResult(order.id, {
      outcome: "declined",
      payment: found.payment || {},
      message: found.found && !found.pending
        ? `Pagamento recusado na autenticação do banco${found.payment.returnMessage ? `: ${found.payment.returnMessage}` : "."}`
        : "Autenticação no banco não concluída pelo cliente. Nada foi cobrado.",
    });
  }
  return getOrderById(orderId);
}

const STALE_MS = 20 * 60 * 1000;

// Página do pedido: se o pagamento ainda espera o banco, confere na Rede (e
// encerra como abandonado depois de 20 min).
export async function refreshWaitingOrder(order) {
  if (order.status !== "aguardando_pagamento" || !order.payment?.threeDSPendingSince) return order;
  const age = Date.now() - new Date(order.payment.threeDSPendingSince).getTime();
  return resolvePendingOrder(order.id, { expire: age > STALE_MS });
}

// Antes de reservar uma bike/link: se outro cliente abandonou a tela do banco
// há mais de 20 min, resolve esse pedido para liberar a reserva.
export async function releaseStaleReservation({ bikeId, linkId }) {
  const now = Date.now();
  const stale = readStore().orders.filter(
    (o) =>
      o.status === "aguardando_pagamento" &&
      o.payment?.threeDSPendingSince &&
      now - new Date(o.payment.threeDSPendingSince).getTime() > STALE_MS &&
      ((bikeId && o.bikeId === bikeId) || (linkId && o.linkId === linkId))
  );
  for (const o of stale) await resolvePendingOrder(o.id, { expire: true });
}

// Dados do navegador enviados pelo checkout (para o 3DS).
export function browserInfo(request, data) {
  const d = data?.device || {};
  return {
    userAgent: request.headers.get("user-agent") || "",
    device: {
      colorDepth: d.colorDepth,
      screenHeight: d.screenHeight,
      screenWidth: d.screenWidth,
      timeZoneOffset: d.timeZoneOffset,
    },
  };
}
