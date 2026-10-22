import { readStore, writeStore } from "./db";
import { NOTIFICATION_EVENTS, notificationEvent } from "./notification-constants";
import { formatPrice } from "./bike-constants";
import { isNxConfigured, sendTemplate } from "./nx";

// Configuração das notificações (fica em settings.notifications) e envio das
// mensagens de pedido pelo WhatsApp oficial via NX.

export function getNotificationSettings() {
  const saved = readStore().settings.notifications || {};
  const events = {};
  for (const def of NOTIFICATION_EVENTS) {
    const s = saved.events?.[def.event] || {};
    events[def.event] = {
      enabled: s.enabled ?? def.defaultEnabled,
      templateName: s.templateName || "",
      language: s.language || "pt_BR",
    };
  }
  return { closeTicket: saved.closeTicket ?? true, events };
}

export function saveNotificationSettings(data) {
  const store = readStore();
  const events = {};
  for (const def of NOTIFICATION_EVENTS) {
    const s = data.events?.[def.event] || {};
    events[def.event] = {
      enabled: Boolean(s.enabled),
      // nome de template da Meta: minúsculas, números e _
      templateName: String(s.templateName || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 512),
      language: /^[a-z]{2}(_[A-Z]{2})?$/.test(s.language || "") ? s.language : "pt_BR",
    };
  }
  store.settings = {
    ...store.settings,
    notifications: { closeTicket: Boolean(data.closeTicket), events },
  };
  writeStore(store);
  return getNotificationSettings();
}

function orderLink(order) {
  const base = String(order.siteUrl || process.env.SITE_URL || "").replace(/\/+$/, "");
  return base ? `${base}/pedido/${order.token}` : "";
}

function code(order) {
  return `SB${String(order.id).padStart(5, "0")}`;
}

// Valores das variáveis, na ordem definida em notification-constants.
export function buildParams(event, order) {
  const values = {
    nome: String(order.customer?.name || "").trim().split(/\s+/)[0],
    pedido: code(order),
    produto: order.bikeName,
    valor: formatPrice(order.amountCents || 0),
    link: orderLink(order),
    transportadora: order.shipping?.carrier || "",
    rastreio: order.shipping?.trackingCode || "",
  };
  return notificationEvent(event).params.map(([key]) => values[key]);
}

function logToOrder(orderId, text, entry) {
  const store = readStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) return;
  order.history.push({ at: new Date().toISOString(), status: order.status, text });
  order.notifications = [...(order.notifications || []), entry].slice(-30);
  writeStore(store);
}

// Envia a notificação de um evento. Nunca lança erro: o resultado vai para o
// histórico do pedido. `force` ignora o "ativado" (reenvio manual no painel).
export async function sendOrderNotification(orderId, event, { force = false } = {}) {
  const def = notificationEvent(event);
  if (!def) return { ok: false, error: "Evento desconhecido." };

  const order = readStore().orders.find((o) => o.id === Number(orderId));
  if (!order) return { ok: false, error: "Pedido não encontrado." };

  const config = getNotificationSettings();
  const ev = config.events[event];
  if (!force && !ev.enabled) return { ok: false, skipped: true };
  if (!isNxConfigured()) {
    if (force) return { ok: false, error: "API da NX não configurada no servidor." };
    return { ok: false, skipped: true };
  }
  if (!ev.templateName) {
    const error = `Template de "${def.label}" não configurado.`;
    if (force) return { ok: false, error };
    logToOrder(order.id, `WhatsApp "${def.label}" não enviado: ${error}`, { event, at: new Date().toISOString(), ok: false, error });
    return { ok: false, error };
  }

  const result = await sendTemplate({
    phone: order.customer?.phone,
    templateName: ev.templateName,
    language: ev.language,
    params: buildParams(event, order),
    closeTicket: config.closeTicket,
  });

  logToOrder(
    order.id,
    result.ok
      ? `WhatsApp "${def.label}" enviado ao cliente.`
      : `WhatsApp "${def.label}" falhou: ${result.error}`,
    { event, at: new Date().toISOString(), ok: result.ok, error: result.error || "", ticketId: result.ticketId ?? null }
  );
  if (!result.ok) console.error(`[nx] ${code(order)} ${event}: ${result.error}`);
  return result;
}

// Envio de teste com dados fictícios para um número informado no painel.
export async function sendTestNotification(event, phone, siteUrl) {
  const def = notificationEvent(event);
  if (!def) return { ok: false, error: "Evento desconhecido." };
  const config = getNotificationSettings();
  const ev = config.events[event];
  if (!ev.templateName) return { ok: false, error: "Preencha e salve o nome do template antes de testar." };

  const sample = {
    id: 123,
    token: "exemplo",
    bikeName: "Specialized Rockhopper (teste)",
    amountCents: 1234500,
    customer: { name: "Cliente Teste" },
    shipping: { carrier: "Correios SEDEX", trackingCode: "AA123456789BR" },
    siteUrl: siteUrl || process.env.SITE_URL || "",
  };
  return sendTemplate({
    phone,
    templateName: ev.templateName,
    language: ev.language,
    params: buildParams(event, sample),
    closeTicket: config.closeTicket,
  });
}
