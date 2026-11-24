// Limite de parcelas do cartão (e.Rede) — configuração única para o link de
// pagamento e o checkout das bikes. Lido das variáveis de ambiente a cada
// requisição, então só pode ser usado no servidor (Server Components e rotas);
// os formulários recebem o número pronto por props.
//
//   REDE_MAX_INSTALLMENTS   máximo de parcelas (padrão 12, teto 21). Só suba
//                           acima de 12 depois que a Rede liberar no seu PV.
//   REDE_MIN_INSTALLMENT_CENTS  valor mínimo de cada parcela, em centavos
//                           (ex.: 5000 = R$ 50,00). Vazio/0 = sem mínimo.
//                           Evita oferecer parcelas que a Rede recusa por valor baixo.

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

export function redeMinInstallmentCents() {
  return intFromEnv("REDE_MIN_INSTALLMENT_CENTS") || 0;
}

// Parcelas que podem ser oferecidas para um valor: o menor entre o limite
// global, o limite próprio da bike/link (`cap`) e o que respeita a parcela
// mínima. À vista (1x) sempre pode.
export function allowedInstallments(amountCents, cap = HARD_MAX_INSTALLMENTS) {
  const own = Math.max(1, Math.round(Number(cap) || 1));
  let max = Math.min(redeMaxInstallments(), own);
  const minCents = redeMinInstallmentCents();
  const amount = Math.round(Number(amountCents) || 0);
  if (minCents > 0 && amount > 0) max = Math.min(max, Math.floor(amount / minCents));
  return Math.max(1, max);
}
