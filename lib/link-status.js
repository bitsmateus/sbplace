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

export const MAX_LINK_INSTALLMENTS = 12;
