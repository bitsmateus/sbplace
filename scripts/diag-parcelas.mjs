// Diagnóstico das parcelas na Rede — SÓ LEITURA dos pedidos com cartão.
// Não imprime dados do cliente nem do cartão. Uso, no console do container:
//   node scripts/diag-parcelas.mjs
import fs from "node:fs";
const path = process.argv[2] || process.env.DB_PATH || `${process.env.DATA_DIR || "/app/data"}/sbplace.json`;
const { orders = [] } = JSON.parse(fs.readFileSync(path, "utf-8"));
const brl = (c) => (Number(c || 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const lastMsg = (o) => [...(o.history || [])].reverse().find((h) => h.text)?.text || "";

const row = (o) => ({
  pedido: o.id,
  data: String(o.createdAt || "").slice(0, 16).replace("T", " "),
  origem: o.source === "link" ? `link #${o.linkId}` : "bike",
  parcelas: o.installments,
  valor: brl(o.amountCents),
  parcela: brl(o.installmentValueCents),
  status: o.status,
  returnCode: o.payment?.returnCode || "-",
  returnMessage: (o.payment?.returnMessage || "").slice(0, 70),
  "3DS": o.payment?.threeDS ? "sim" : "não",
  historico: lastMsg(o).slice(0, 80),
});

console.log(`\n== Pedidos com mais de 12 parcelas (${path}) ==`);
const acima = orders.filter((o) => Number(o.installments) > 12);
acima.length ? console.table(acima.map(row)) : console.log("Nenhum.");

console.log("\n== Comparação: pedidos até 12x que passaram pela Rede (para checar valor mínimo/máximo) ==");
const ate12 = orders.filter((o) => Number(o.installments) <= 12 && (o.payment?.returnCode || o.status !== "aguardando_pagamento"));
console.table(ate12.map(row));

console.log("\n== Histórico completo dos pedidos (passo a passo) ==");
for (const o of orders) {
  console.log(`\nPedido #${o.id} — ${o.installments}x de ${brl(o.installmentValueCents)} (total ${brl(o.amountCents)}) — ${o.status}`);
  for (const h of o.history || []) console.log(`  ${String(h.at || "").slice(0, 19).replace("T", " ")}  [${h.status}]  ${h.text || ""}`);
}

console.log("\n== Resumo por returnCode ==");
const resumo = {};
for (const o of orders) {
  const k = `${o.payment?.returnCode || "-"} | ${(o.payment?.returnMessage || "").slice(0, 60)}`;
  resumo[k] ||= { pedidos: 0, ate12x: 0, acima12x: 0, aprovados: 0 };
  resumo[k].pedidos += 1;
  resumo[k][Number(o.installments) > 12 ? "acima12x" : "ate12x"] += 1;
  if (["pago", "enviado", "entregue"].includes(o.status)) resumo[k].aprovados += 1;
}
console.table(resumo);
