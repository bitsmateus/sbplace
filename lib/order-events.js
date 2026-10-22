// Ponto único de saída dos eventos de pedido, para as notificações de
// WhatsApp (compra confirmada, enviado, entregue...). Ainda não está ligado a
// nenhum sistema: quando a integração for feita, basta implementar o envio
// aqui — todas as mudanças de status já chamam esta função.
//
// event: "pago" | "enviado" | "entregue" | "cancelado"
export function notifyOrderEvent(order, event) {
  // TODO: integração com o WhatsApp (NX Systems) — notificar o cliente em
  // order.customer.phone. Falhas aqui nunca podem desfazer a mudança do pedido.
}
