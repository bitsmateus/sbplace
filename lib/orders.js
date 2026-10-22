import crypto from "node:crypto";
import { readStore, writeStore } from "./db";
import { notifyOrderEvent } from "./order-events";
import { linkEffectiveStatus } from "./link-status";

export { ORDER_STATUS, orderStatusLabel } from "./order-constants";

// Todas as funções que mudam pedido + bike leem e gravam o arquivo na mesma
// chamada síncrona (sem await no meio), então duas requisições simultâneas
// nunca enxergam a bike como "disponível" ao mesmo tempo.

export function orderCode(order) {
  return `SB${String(order.id).padStart(5, "0")}`;
}

function logEntry(order, status, text) {
  order.history.push({ at: new Date().toISOString(), status, text });
  order.status = status;
  order.updatedAt = new Date().toISOString();
}

export function listOrders({ status } = {}) {
  const { orders } = readStore();
  const result = status ? orders.filter((o) => o.status === status) : orders;
  return [...result].sort((a, b) => b.id - a.id);
}

export function getOrderById(id) {
  return readStore().orders.find((o) => o.id === Number(id)) || null;
}

export function getOrderByToken(token) {
  if (!token || typeof token !== "string") return null;
  return readStore().orders.find((o) => o.token === token) || null;
}

export function countOrdersByStatus() {
  const counts = {};
  for (const o of readStore().orders) counts[o.status] = (counts[o.status] || 0) + 1;
  return counts;
}

// Reserva a bike (única unidade) e cria o pedido. Devolve { error } se a bike
// já foi reservada/vendida por outra pessoa.
export function reserveBikeAndCreateOrder({ bikeId, customer, address, installments }) {
  const store = readStore();
  const bike = store.bikes.find((b) => b.id === Number(bikeId));
  if (!bike || bike.status === "oculta") return { error: "Bicicleta não encontrada." };
  if ((bike.condition || "nova") !== "seminova") {
    return { error: "Esta bike é vendida somente na loja." };
  }
  if (bike.status !== "disponivel") {
    return {
      error:
        bike.status === "vendida"
          ? "Essa bike acabou de ser vendida."
          : "Essa bike está reservada por outro cliente no momento.",
    };
  }
  if (!bike.priceCents) return { error: "Bicicleta sem preço cadastrado." };

  const now = new Date().toISOString();
  const count = Math.max(1, Math.round(installments) || 1);
  const order = {
    id: store.nextOrderId,
    token: crypto.randomBytes(18).toString("base64url"),
    status: "aguardando_pagamento",
    bikeId: bike.id,
    bikeSlug: bike.slug,
    bikeName: bike.name,
    bikeImage: (bike.images || [])[0] || "",
    amountCents: bike.priceCents,
    installments: count,
    installmentValueCents: Math.ceil(bike.priceCents / count),
    customer,
    address,
    payment: { method: "credito" },
    shipping: { carrier: "", trackingCode: "", shippedAt: "", deliveredAt: "" },
    notes: "",
    history: [],
    createdAt: now,
    updatedAt: now,
  };
  logEntry(order, "aguardando_pagamento", "Pedido criado pelo site.");
  store.nextOrderId += 1;
  store.orders.push(order);
  bike.status = "reservada";
  bike.updatedAt = now;
  writeStore(store);
  return { order };
}

// Pedido criado a partir de um link de pagamento manual. O link é de uso único:
// fica "em_uso" enquanto a cobrança acontece (evita pagar duas vezes).
export function reserveLinkAndCreateOrder({ token, customer, address, installments }) {
  const store = readStore();
  const link = store.links.find((l) => l.token === token);
  if (!link) return { error: "Link de pagamento não encontrado." };
  if (linkEffectiveStatus(link) !== "ativo") {
    return { error: "Este link de pagamento não está mais disponível." };
  }

  const now = new Date().toISOString();
  const count = Math.max(1, Math.round(installments) || 1);
  const order = {
    id: store.nextOrderId,
    token: crypto.randomBytes(18).toString("base64url"),
    status: "aguardando_pagamento",
    source: "link",
    linkId: link.id,
    linkToken: link.token,
    bikeId: null,
    bikeSlug: "",
    bikeName: link.description,
    bikeImage: "",
    amountCents: link.amountCents,
    installments: count,
    installmentValueCents: Math.ceil(link.amountCents / count),
    customer,
    address,
    payment: { method: "credito" },
    shipping: { carrier: "", trackingCode: "", shippedAt: "", deliveredAt: "" },
    notes: "",
    history: [],
    createdAt: now,
    updatedAt: now,
  };
  logEntry(order, "aguardando_pagamento", `Pedido criado pelo link de pagamento #${link.id}.`);
  store.nextOrderId += 1;
  store.orders.push(order);
  link.status = "em_uso";
  link.updatedAt = now;
  writeStore(store);
  return { order };
}

function setLinkStatus(store, order, from, to) {
  const link = order.linkId ? store.links.find((l) => l.id === order.linkId) : null;
  if (link && from.includes(link.status)) {
    link.status = to;
    if (to === "pago") link.orderId = order.id;
    link.updatedAt = new Date().toISOString();
  }
}

function findOrder(store, id) {
  return store.orders.find((o) => o.id === Number(id));
}

function setBikeStatus(store, order, from, to) {
  const bike = store.bikes.find((b) => b.id === order.bikeId);
  if (bike && from.includes(bike.status)) {
    bike.status = to;
    bike.updatedAt = new Date().toISOString();
  }
}

// Resultado da cobrança na Rede. "approved" → pago e bike vendida; "declined"
// → libera a bike; "unknown" (falha de rede / resposta estranha) → mantém a
// bike reservada e marca para conferir na Rede, pois o cartão pode ter sido
// cobrado mesmo sem resposta.
export function applyPaymentResult(id, { outcome, payment, message }) {
  const store = readStore();
  const order = findOrder(store, id);
  if (!order) return null;
  order.payment = { ...order.payment, ...payment };

  if (outcome === "approved") {
    if (order.status === "pago" || order.status === "enviado" || order.status === "entregue") {
      return order;
    }
    logEntry(order, "pago", message || "Pagamento aprovado.");
    setBikeStatus(store, order, ["reservada", "disponivel"], "vendida");
    setLinkStatus(store, order, ["em_uso", "ativo"], "pago");
  } else if (outcome === "declined") {
    logEntry(order, "recusado", message || "Pagamento recusado.");
    setBikeStatus(store, order, ["reservada"], "disponivel");
    setLinkStatus(store, order, ["em_uso"], "ativo");
  } else {
    logEntry(
      order,
      "verificar_pagamento",
      message || "Não foi possível confirmar o pagamento. Confira na Rede."
    );
  }
  writeStore(store);
  if (outcome === "approved") notifyOrderEvent(order, "pago");
  return order;
}

export function markShipped(id, { carrier, trackingCode }) {
  const store = readStore();
  const order = findOrder(store, id);
  if (!order) return { error: "Pedido não encontrado." };
  if (order.status !== "pago" && order.status !== "enviado") {
    return { error: "Só pedidos pagos podem ser marcados como enviados." };
  }
  order.shipping = {
    ...order.shipping,
    carrier: String(carrier || "").trim().slice(0, 80),
    trackingCode: String(trackingCode || "").trim().slice(0, 80),
    shippedAt: order.shipping.shippedAt || new Date().toISOString(),
  };
  const detail = [order.shipping.carrier, order.shipping.trackingCode]
    .filter(Boolean)
    .join(" · ");
  const wasShipped = order.status === "enviado";
  logEntry(
    order,
    "enviado",
    wasShipped
      ? `Dados de envio atualizados${detail ? `: ${detail}` : ""}.`
      : `Marcado como enviado${detail ? `: ${detail}` : ""}.`
  );
  writeStore(store);
  if (!wasShipped) notifyOrderEvent(order, "enviado");
  return { order };
}

export function markDelivered(id) {
  const store = readStore();
  const order = findOrder(store, id);
  if (!order) return { error: "Pedido não encontrado." };
  if (order.status !== "enviado") {
    return { error: "Só pedidos enviados podem ser marcados como entregues." };
  }
  order.shipping.deliveredAt = new Date().toISOString();
  logEntry(order, "entregue", "Marcado como entregue.");
  writeStore(store);
  notifyOrderEvent(order, "entregue");
  return { order };
}

// Cancela o pedido no painel e devolve a bike ao catálogo. NÃO devolve o
// dinheiro: o estorno de um pedido pago é feito no portal da Rede.
export function cancelOrder(id, reason) {
  const store = readStore();
  const order = findOrder(store, id);
  if (!order) return { error: "Pedido não encontrado." };
  if (order.status === "cancelado" || order.status === "entregue") {
    return { error: "Este pedido não pode mais ser cancelado." };
  }
  const why = String(reason || "").trim().slice(0, 300);
  logEntry(order, "cancelado", `Pedido cancelado${why ? `: ${why}` : "."}`);
  setBikeStatus(store, order, ["reservada", "vendida"], "disponivel");
  setLinkStatus(store, order, ["em_uso", "pago"], "cancelado");
  writeStore(store);
  notifyOrderEvent(order, "cancelado");
  return { order };
}

export function saveOrderNotes(id, notes) {
  const store = readStore();
  const order = findOrder(store, id);
  if (!order) return null;
  order.notes = String(notes || "").slice(0, 2000);
  order.updatedAt = new Date().toISOString();
  writeStore(store);
  return order;
}
