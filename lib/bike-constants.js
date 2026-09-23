// Pure constants/helpers only — no database import here.
// This file is safe to import from Client Components.

export const CATEGORIES = [
  { value: "urbana", label: "Urbana" },
  { value: "mtb", label: "Mountain bike" },
  { value: "speed", label: "Speed" },
  { value: "eletrica", label: "E-bikes" },
  { value: "infantil", label: "Infantil" },
  { value: "acessorios", label: "Acessórios" },
];

export const CONDITIONS = [
  { value: "nova", label: "Nova" },
  { value: "seminova", label: "Seminova" },
];

// Máximo de parcelas sem juros no cartão, por condição.
export const MAX_INSTALLMENTS = { nova: 12, seminova: 21 };

export const STATUS = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservada", label: "Reservada" },
  { value: "vendida", label: "Vendida" },
];

export function formatPrice(cents) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Parcelamento: automático (preço / máx. de parcelas da condição), mas a loja
// pode ajustar o nº de parcelas e/ou o valor da parcela em cada bike.
export function installmentInfo(bike) {
  const custom = Math.round(Number(bike.installments) || 0);
  const count =
    custom > 0
      ? custom
      : MAX_INSTALLMENTS[bike.condition] || MAX_INSTALLMENTS.nova;
  const valueCents =
    Number(bike.installmentValueCents) > 0
      ? Number(bike.installmentValueCents)
      : Math.round((bike.priceCents || 0) / count);
  return { count, valueCents };
}

export function installmentText(bike) {
  if (!bike.priceCents) return "";
  const { count, valueCents } = installmentInfo(bike);
  return `${count}x de ${formatPrice(valueCents)} sem juros`;
}
