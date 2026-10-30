// Estados do link de pagamento — puro, sem banco (pode ir para Client Components).
//   ativo     pode ser pago
//   em_uso    alguém está pagando agora / aguardando conferência da Rede
//   pago      já foi pago (link de uso único)
//   cancelado desativado pela loja
//   expirado  passou da validade sem ser pago (calculado, não é gravado)

export const LINK_STATUS = [
  { value: "ativo", label: "Ativo", tone: "ok" },
  { value: "em_uso", label: "Pagamento em andamento", tone: "alert" },
  { value: "pago", label: "Pago", tone: "done" },
  { value: "expirado", label: "Expirado", tone: "wait" },
  { value: "cancelado", label: "Cancelado", tone: "bad" },
];

export function linkEffectiveStatus(link, now = Date.now()) {
  if (link.status === "ativo" && link.expiresAt && new Date(link.expiresAt).getTime() < now) {
    return "expirado";
  }
  return link.status;
}

// Até 21x nos links (em teste: o manual da e.Rede fala em 2 a 12 parcelas;
// se a Rede recusar acima de 12x, voltar para 12). O padrão do formulário
// continua 12x. O checkout das bikes tem o próprio limite (MAX_ONLINE_INSTALLMENTS).
export const MAX_LINK_INSTALLMENTS = 21;
