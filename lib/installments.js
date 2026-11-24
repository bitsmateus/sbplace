// Limite de parcelas do cartão (e.Rede) — configuração única para o link de
// pagamento e o checkout das bikes. Lido das variáveis de ambiente a cada
// requisição, então só pode ser usado no servidor (Server Components e rotas);
// os formulários recebem o número pronto por props.
//
//   REDE_MAX_INSTALLMENTS   máximo de parcelas (padrão 12, teto 21). Só suba
//                           acima de 12 depois que a Rede liberar no seu PV.

export const DEFAULT_MAX_INSTALLMENTS = 12;
export const HARD_MAX_INSTALLMENTS = 21;

function intFromEnv(name) {
  const raw = String(process.env[name] ?? "").trim();
  if (!/^\d+$/.test(raw)) return null;
  return Number(raw);
}

export function redeMaxInstallments() {
  const value = intFromEnv("REDE_MAX_INSTALLMENTS");
  if (value == null || value < 1) return DEFAULT_MAX_INSTALLMENTS;
  return Math.min(value, HARD_MAX_INSTALLMENTS);
}

// Parcelas que podem ser oferecidas para um valor: o menor entre o limite
// global e o limite próprio da bike/link (`cap`).
export function allowedInstallments(amountCents, cap = HARD_MAX_INSTALLMENTS) {
  const own = Math.max(1, Math.round(Number(cap) || 1));
  return Math.max(1, Math.min(redeMaxInstallments(), own));
}
