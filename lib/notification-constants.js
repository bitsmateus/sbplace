// Eventos de pedido que geram mensagem de WhatsApp (template oficial da Meta,
// enviado pela API da NX / Z-PRO). Puro, sem banco: pode ir para o navegador.
//
// "params" é a ordem das variáveis do corpo do template: {{1}}, {{2}}, ...
// O template criado na Meta precisa ter exatamente essa quantidade.

export const NOTIFICATION_EVENTS = [
  {
    event: "pago",
    label: "Compra confirmada",
    when: "Quando o pagamento é aprovado.",
    defaultEnabled: true,
    params: [
      ["nome", "Primeiro nome do cliente"],
      ["pedido", "Código do pedido (ex: SB00012)"],
      ["produto", "Bike ou descrição do link"],
      ["valor", "Valor pago (ex: R$ 12.000,00)"],
      ["link", "Link para acompanhar o pedido"],
    ],
    example:
      "Olá, {{1}}! Seu pagamento foi aprovado. Pedido {{2}}: {{3}}, no valor de {{4}}. Acompanhe por aqui: {{5}}",
  },
  {
    event: "enviado",
    label: "Pedido enviado",
    when: "Quando você marca o pedido como enviado.",
    defaultEnabled: true,
    params: [
      ["nome", "Primeiro nome do cliente"],
      ["pedido", "Código do pedido"],
      ["produto", "Bike ou descrição do link"],
      ["transportadora", "Transportadora / serviço"],
      ["rastreio", "Código de rastreio"],
      ["link", "Link para acompanhar o pedido"],
    ],
    example:
      "Olá, {{1}}! Seu pedido {{2}} ({{3}}) foi enviado por {{4}}. Código de rastreio: {{5}}. Acompanhe: {{6}}",
  },
  {
    event: "entregue",
    label: "Pedido entregue",
    when: "Quando você marca o pedido como entregue.",
    defaultEnabled: true,
    params: [
      ["nome", "Primeiro nome do cliente"],
      ["pedido", "Código do pedido"],
      ["produto", "Bike ou descrição do link"],
    ],
    example:
      "Olá, {{1}}! Seu pedido {{2}} ({{3}}) foi entregue. Bons pedais! Qualquer coisa, é só chamar a gente por aqui.",
  },
  {
    event: "cancelado",
    label: "Pedido cancelado",
    when: "Quando você cancela o pedido no painel.",
    defaultEnabled: false,
    params: [
      ["nome", "Primeiro nome do cliente"],
      ["pedido", "Código do pedido"],
      ["produto", "Bike ou descrição do link"],
    ],
    example: "Olá, {{1}}. Seu pedido {{2}} ({{3}}) foi cancelado. Se tiver dúvidas, fale com a gente por aqui.",
  },
];

export function notificationEvent(event) {
  return NOTIFICATION_EVENTS.find((e) => e.event === event) || null;
}
