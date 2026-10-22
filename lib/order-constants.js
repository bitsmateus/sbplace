// Constantes e validações puras dos pedidos — sem acesso a banco, então podem
// ser importadas tanto por Client Components quanto pelo servidor.

export const ORDER_STATUS = [
  { value: "aguardando_pagamento", label: "Aguardando pagamento", tone: "wait" },
  { value: "verificar_pagamento", label: "Verificar pagamento", tone: "alert" },
  { value: "pago", label: "Pago — preparar envio", tone: "ok" },
  { value: "enviado", label: "Enviado", tone: "info" },
  { value: "entregue", label: "Entregue", tone: "done" },
  { value: "recusado", label: "Pagamento recusado", tone: "bad" },
  { value: "cancelado", label: "Cancelado", tone: "bad" },
];

export function orderStatusLabel(value) {
  return ORDER_STATUS.find((s) => s.value === value)?.label || value;
}

export function orderStatusTone(value) {
  return ORDER_STATUS.find((s) => s.value === value)?.tone || "wait";
}

// Máximo de parcelas aceitas no checkout online (limite do crédito parcelado
// da e.Rede), mesmo que a bike anuncie mais parcelas na loja.
export const MAX_ONLINE_INSTALLMENTS = 12;

export function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function isValidCpf(value) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const size of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < size; i += 1) sum += Number(cpf[i]) * (size + 1 - i);
    const digit = ((sum * 10) % 11) % 10;
    if (digit !== Number(cpf[size])) return false;
  }
  return true;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? "").trim());
}

// Algoritmo de Luhn: pega erro de digitação no número do cartão antes de
// gastar uma chamada (e uma tentativa) na operadora.
export function isValidCardNumber(value) {
  const digits = onlyDigits(value);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function formatCpf(value) {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function formatPhone(value) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatCardNumber(value) {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}
