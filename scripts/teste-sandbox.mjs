// Teste de parcelas no SANDBOX da e.Rede, com cartão de teste público da Rede.
// Recusa-se a rodar com REDE_ENV diferente de "sandbox". Não imprime credenciais.
// Uso: REDE_ENV=sandbox REDE_PV=... REDE_TOKEN=... node scripts/teste-sandbox.mjs 2 12 13 21
if (process.env.REDE_ENV !== "sandbox") { console.error("Abortado: só roda com REDE_ENV=sandbox."); process.exit(1); }
const { REDE_PV: pv, REDE_TOKEN: token } = process.env;
if (!pv || !token) { console.error("Faltam REDE_PV/REDE_TOKEN do sandbox."); process.exit(1); }
const basic = Buffer.from(`${pv}:${token}`).toString("base64");
const tok = await fetch("https://rl7-sandbox-api.useredecloud.com.br/oauth2/token", {
  method: "POST", headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
  body: "grant_type=client_credentials",
}).then((r) => r.json());
if (!tok.access_token) { console.error("Falha no OAuth do sandbox:", tok.error || tok.message || "?"); process.exit(1); }
const amount = Number(process.env.VALOR_CENTS || 2100000); // R$ 21.000,00 por padrão
for (const n of (process.argv.slice(2).length ? process.argv.slice(2) : ["12", "13", "21"]).map(Number)) {
  const res = await fetch("https://sandbox-erede.useredecloud.com.br/v2/transactions", {
    method: "POST",
    headers: { Authorization: `Bearer ${tok.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      capture: true, kind: "credit", reference: `TESTE${n}X${Date.now()}`.slice(0, 16), amount, installments: n,
      cardholderName: "TESTE SANDBOX", cardNumber: "5448280000000007", // cartão de teste da Rede
      expirationMonth: 12, expirationYear: new Date().getFullYear() + 2, securityCode: "123",
      subscription: false, origin: 1,
    }),
  });
  const b = await res.json().catch(() => ({}));
  console.log(`${String(n).padStart(2)}x  R$ ${(amount / 100).toFixed(2)}  HTTP ${res.status}  returnCode=${b.returnCode ?? "-"}  ${b.returnMessage || ""}`);
}
