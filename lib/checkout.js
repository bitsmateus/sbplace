import {
  isValidCardNumber,
  isValidCpf,
  isValidEmail,
  onlyDigits,
} from "./order-constants";
import { readStore } from "./db";
import { applyPaymentResult, getOrderById, orderCode } from "./orders";
import { chargeCreditCard, findTransaction, isThreeDSEnabled } from "./rede";
import { redeMaxInstallments } from "./installments";

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
  // o teto global vale mesmo se a rota passar um limite maior
  const limit = Math.min(Number(maxInstallments) || 1, redeMaxInstallments());
  if (installments < 1 || installments > limit) return { error: "Número de parcelas inválido." };

  return { customer, address, card, installments };
}

// Recusa por número de parcelas (o PV não aceita esse parcelamento). A Rede
// não publica uma lista aberta de códigos, então reconhecemos pela mensagem
// ("Installments: ...", "Instalment not allowed", "parcela...").
const INSTALLMENT_DECLINE = /\binstall?ments?\b|parcel/i;
// Até quantas parcelas sugerir ao cliente quando a Rede recusar o parcelamento.
const SAFE_INSTALLMENTS = 12;

export function isInstallmentDecline(payment = {}, installments = 1) {
  if (Number(installments) <= 1) return false;
  return INSTALLMENT_DECLINE.test(`${payment.returnMessage || ""} ${payment.threeDSReturnMessage || ""}`);
}

export function installmentDeclineCustomerMessage(installments) {
  const n = Number(installments) || 1;
  const hint = n > SAFE_INSTALLMENTS ? `em até ${SAFE_INSTALLMENTS}x` : "em menos parcelas";
  return `A operadora não aceitou o pagamento em ${n}x. Nada foi cobrado. Tente ${hint} ou fale com a gente no WhatsApp.`;
}

function codeText(payment = {}) {
  const parts = [];
  if (payment.returnCode) parts.push(`código ${payment.returnCode}`);
  if (payment.threeDSReturnCode) parts.push(`3DS ${payment.threeDSReturnCode}`);
  return parts.length ? ` (${parts.join(", ")})` : "";
}

// Mensagem do histórico (equipe) para uma recusa, com o motivo da Rede.
function declineHistory(order, payment, prefix) {
  if (isInstallmentDecline(payment, order.installments)) {
    return `Recusado pelo número de parcelas (${order.installments}x)${payment.returnMessage ? `: ${payment.returnMessage}` : ""}${codeText(payment)}. O PV pode não aceitar esse parcelamento.`;
  }
  const why = payment.returnMessage || payment.threeDSReturnMessage || "";
  return `${prefix}${why ? `: ${why}` : "."}${codeText(payment)}`;
}

// Cobra o pedido já criado/reservado e devolve { status, body } para a rota.
// browser: { device, userAgent } do navegador do cliente (para o 3DS).
export async function chargeOrder(order, card, browser = {}) {
  const base = String(order.siteUrl || "").replace(/\/+$/, "");
  // URLs separadas para sucesso e falha: assim sabemos o que o banco disse
  // ao devolver o cliente (o resultado em si é sempre conferido na Rede).
  const returnUrl = `${base}/api/rede/retorno?pedido=${encodeURIComponent(order.token)}`;
  const result = await chargeCreditCard({
    reference: orderCode(order),
    amountCents: order.amountCents,
    installments: order.installments,
    card,
    threeDS:
      isThreeDSEnabled() && base
        ? {
            device: browser.device,
            userAgent: browser.userAgent,
            successUrl: `${returnUrl}&r=ok`,
            failureUrl: `${returnUrl}&r=falha`,
          }
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
    const byInstallments = !result.configError && isInstallmentDecline(payment, order.installments);
    if (byInstallments) payment.declineReason = "parcelas";
    applyPaymentResult(order.id, {
      outcome: "declined",
      payment,
      message: result.configError
        ? `Pagamento não processado — ${result.detail || "credenciais da Rede inválidas"}. Confira REDE_PV, REDE_TOKEN e REDE_ENV.`
        : declineHistory(order, payment, "Pagamento recusado"),
    });
    return {
      status: result.configError ? 503 : 402,
      body: {
        error: result.configError
          ? "O pagamento online está indisponível no momento. Fale com a gente pelo WhatsApp."
          : byInstallments
            ? installmentDeclineCustomerMessage(order.installments)
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
// `bank` = o que o banco disse ao devolver o cliente ("ok" / "falha"), vindo
// da URL de retorno; nesse caso a Rede é consultada mais de uma vez, porque
// logo após a volta do banco a transação pode ainda não aparecer.
const RETRY_DELAYS_MS = [0, 2000, 3000];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function lookupNote(found) {
  if (found.error) return found.error;
  if (!found.found) return `Rede: transação não encontrada (consulta por ${found.via}, HTTP ${found.httpStatus || "?"})`;
  return `Rede: status ${found.status || "-"}, código ${found.payment?.returnCode || "-"}${found.payment?.threeDSReturnCode ? `, 3DS ${found.payment.threeDSReturnCode}` : ""}`;
}

export async function resolvePendingOrder(orderId, { expire = false, bank = "" } = {}) {
  const order = getOrderById(orderId);
  if (!order || order.status !== "aguardando_pagamento") return order;

  const query = { tid: order.payment?.tid, reference: orderCode(order) };
  const delays = bank ? RETRY_DELAYS_MS : [0];
  let found = null;
  for (const delay of delays) {
    if (delay) await wait(delay);
    found = await findTransaction(query);
    // sem TID gravado (ou TID não achado): tenta pela referência
    if (!found.error && !found.found && query.tid) found = await findTransaction({ reference: query.reference });
    if (found.error) continue;
    if (found.found && !found.pending) break; // resposta definitiva
  }

  const lookup = {
    at: new Date().toISOString(),
    bank: bank || "",
    via: found.via || "",
    httpStatus: found.httpStatus || 0,
    status: found.status || "",
    note: lookupNote(found),
  };
  const bankText = bank === "ok" ? "o banco devolveu como autenticado" : bank === "falha" ? "o banco devolveu como falha" : "";

  if (found.error) {
    // não deu para falar com a Rede: mantém aguardando (a página do pedido confere de novo)
    return getOrderById(orderId);
  }

  if (found.found && found.approved) {
    applyPaymentResult(order.id, {
      outcome: "approved",
      payment: { ...found.payment, lastLookup: lookup },
      message: "Pagamento aprovado (autenticado no banco).",
    });
    return getOrderById(orderId);
  }

  if (found.found && !found.pending) {
    const payment = { ...found.payment, lastLookup: lookup };
    if (isInstallmentDecline(payment, order.installments)) payment.declineReason = "parcelas";
    applyPaymentResult(order.id, {
      outcome: "declined",
      payment,
      message: declineHistory(order, payment, "Pagamento recusado na autenticação do banco"),
    });
    return getOrderById(orderId);
  }

  // Ainda pendente ou não encontrada na Rede.
  if (!expire && bank !== "falha") return getOrderById(orderId);

  applyPaymentResult(order.id, {
    outcome: "declined",
    payment: { ...(found.payment || {}), lastLookup: lookup },
    message: expire
      ? `Autenticação no banco não concluída em 20 minutos. Nada foi cobrado. (${lookup.note})`
      : `Compra não autenticada: ${bankText}. Nada foi cobrado. (${lookup.note})`,
  });
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
