import { sendOrderNotification } from "./notifications";

// Ponto único de saída dos eventos de pedido. Hoje dispara a mensagem de
// WhatsApp (template oficial via NX) — configurada em Configurações.
// Roda em segundo plano: uma falha no envio nunca desfaz a mudança do pedido
// (o resultado fica registrado no histórico do pedido).
//
// event: "pago" | "enviado" | "entregue" | "cancelado"
export function notifyOrderEvent(order, event) {
  sendOrderNotification(order.id, event).catch((err) => {
    console.error(`[notificacao] pedido ${order.id} ${event}: ${err?.message || err}`);
  });
}
