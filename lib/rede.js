// Cliente da e.Rede (Itaú) — API REST v2 com OAuth2 (client_credentials).
// O PV (número de afiliação) é o client_id e o token de integração é o
// client_secret. Tudo vem de variáveis de ambiente; nada disso vai para o
// navegador.
//
// Dados do cartão passam por aqui só em memória, a caminho da Rede: nunca são
// gravados em disco nem escritos em log.

const ENVIRONMENTS = {
  sandbox: {
    tokenUrls: ["https://rl7-sandbox-api.useredecloud.com.br/oauth2/token"],
    apiUrl: "https://sandbox-erede.useredecloud.com.br/v2/transactions",
  },
  production: {
    // A documentação oficial cita /redelabs/oauth2/token; alguns SDKs usam
    // /erede/oauth2/token. Tentamos as duas e guardamos a que funcionar.
    tokenUrls: [
      "https://api.userede.com.br/redelabs/oauth2/token",
      "https://api.userede.com.br/erede/oauth2/token",
    ],
    apiUrl: "https://api.userede.com.br/erede/v2/transactions",
  },
};

const TIMEOUT_MS = 30_000;

function settings() {
  const env = process.env.REDE_ENV === "production" ? "production" : "sandbox";
  return {
    env,
    pv: process.env.REDE_PV || "",
    token: process.env.REDE_TOKEN || "",
    tokenUrls: process.env.REDE_TOKEN_URL
      ? [process.env.REDE_TOKEN_URL]
      : ENVIRONMENTS[env].tokenUrls,
    apiUrl: process.env.REDE_API_URL || ENVIRONMENTS[env].apiUrl,
    // Só é enviado se configurado: contas sem o recurso habilitado na Rede
    // recusam a transação ("Softdescriptor: Not enabled for this merchant").
    softDescriptor: (process.env.REDE_SOFT_DESCRIPTOR || "")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .slice(0, 13),
  };
}

// 3D Secure 2 (autenticação no app/SMS do banco). Ligado por padrão — a conta
// precisa ter o 3DS habilitado na Rede. REDE_3DS=false desliga.
export function isThreeDSEnabled() {
  return process.env.REDE_3DS !== "false";
}

// O checkout online só aparece no site quando a Rede está configurada.
export function isRedeConfigured() {
  const { pv, token } = settings();
  return Boolean(pv && token);
}

export function redeEnvironment() {
  return settings().env;
}

let cachedToken = null; // { value, expiresAt }
let workingTokenUrl = null;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken(force = false) {
  if (!force && cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }
  const cfg = settings();
  const basic = Buffer.from(`${cfg.pv}:${cfg.token}`).toString("base64");
  // tenta primeiro a URL que já funcionou
  const urls = workingTokenUrl
    ? [workingTokenUrl, ...cfg.tokenUrls.filter((u) => u !== workingTokenUrl)]
    : cfg.tokenUrls;
  const problems = [];
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.access_token) {
        const ttl = Number(data.expires_in) || 300;
        cachedToken = { value: data.access_token, expiresAt: Date.now() + ttl * 1000 };
        workingTokenUrl = url;
        return cachedToken.value;
      }
      // só status e mensagem de erro da Rede — nunca as credenciais
      const why = data.error_description || data.error || data.message || "";
      problems.push(`${new URL(url).pathname} → HTTP ${res.status}${why ? ` (${String(why).slice(0, 120)})` : ""}`);
    } catch (err) {
      problems.push(`${new URL(url).pathname} → ${err.name === "AbortError" ? "sem resposta" : "erro de conexão"}`);
    }
  }
  const err = new Error(`Rede: falha na autenticação: ${problems.join("; ")}`);
  err.authFailed = true;
  throw err;
}

// Chamada autenticada; se o token expirou (401), renova e tenta uma vez.
async function redeFetch(url, options) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const accessToken = await getAccessToken(attempt > 0);
    const res = await fetchWithTimeout(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
    });
    if (res.status !== 401 || attempt === 1) return res;
  }
}

function interpret(res, body) {
  const code = body?.returnCode != null ? String(body.returnCode) : "";
  const payment = {
    tid: body?.tid || "",
    nsu: body?.nsu || "",
    authorizationCode: body?.authorizationCode || "",
    returnCode: code,
    returnMessage: body?.returnMessage || "",
  };
  if (code === "00") return { outcome: "approved", payment };
  // 220: o banco quer autenticar (3DS) — o cliente vai para a página do banco
  if (code === "220") {
    const redirectUrl = body?.threeDSecure?.url || "";
    return redirectUrl ? { outcome: "authenticate", payment, redirectUrl } : { outcome: "unknown", payment };
  }
  // A Rede respondeu com um código de recusa/validação: a cobrança não ocorreu.
  if (code) return { outcome: "declined", payment };
  if (res.status === 401 || res.status === 403) {
    return {
      outcome: "declined",
      payment,
      configError: true,
      detail: `A Rede recusou o acesso (HTTP ${res.status})${body?.message ? `: ${String(body.message).slice(0, 120)}` : "."}`,
    };
  }
  // Sem returnCode (erro 5xx, resposta fora do padrão): não dá para saber.
  return { outcome: "unknown", payment };
}

// Dados do navegador exigidos pelo 3DS 2 (vêm do checkout). Valores fora do
// esperado caem em padrões seguros.
function deviceFrom(device = {}) {
  const int = (v, def) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : def);
  return {
    colorDepth: int(device.colorDepth, 24),
    deviceType3ds: "BROWSER",
    javaEnabled: false,
    language: "BR",
    screenHeight: int(device.screenHeight, 800),
    screenWidth: int(device.screenWidth, 1280),
    timeZoneOffset: int(device.timeZoneOffset, 3),
  };
}

// Cobra no cartão de crédito (autorização + captura imediata).
// card: { number, cvv, month, year, holder }
// threeDS (opcional): { device, userAgent, successUrl, failureUrl }
export async function chargeCreditCard({ reference, amountCents, installments, card, threeDS }) {
  const cfg = settings();
  const authentication = threeDS
    ? {
        threeDSecure: {
          embedded: true,
          onFailure: "decline",
          threeDIndicator: "2",
          userAgent: String(threeDS.userAgent || "").slice(0, 500),
          device: deviceFrom(threeDS.device),
        },
        urls: [
          { kind: "threeDSecureSuccess", url: threeDS.successUrl },
          { kind: "threeDSecureFailure", url: threeDS.failureUrl },
        ],
      }
    : {};
  try {
    const res = await redeFetch(cfg.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capture: true,
        kind: "credit",
        reference,
        amount: amountCents,
        installments,
        cardholderName: card.holder,
        cardNumber: card.number,
        expirationMonth: Number(card.month),
        expirationYear: Number(card.year),
        securityCode: card.cvv,
        ...(cfg.softDescriptor ? { softDescriptor: cfg.softDescriptor } : {}),
        subscription: false,
        origin: 1,
        ...authentication,
      }),
    });
    const body = await res.json().catch(() => null);
    const result = interpret(res, body);
    if (result.outcome !== "approved" && result.outcome !== "authenticate") {
      // sem dados do cartão: só status HTTP e código de retorno
      console.error(
        `[rede] ${reference} não aprovado — HTTP ${res.status}, returnCode=${result.payment.returnCode || "-"}`
      );
    }
    return result;
  } catch (err) {
    console.error(`[rede] ${reference} sem resposta: ${err.authFailed ? err.message : err.name}`);
    if (err.authFailed) {
      return { outcome: "declined", payment: {}, configError: true, detail: err.message };
    }
    return { outcome: "unknown", payment: {} };
  }
}

// Consulta uma transação pela referência do pedido (usado para conferir
// pedidos "verificar pagamento").
export async function findTransactionByReference(reference) {
  const cfg = settings();
  try {
    const res = await redeFetch(`${cfg.apiUrl}?reference=${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const body = await res.json().catch(() => null);
    if (res.status === 404) return { found: false };
    if (!res.ok || !body) return { error: `A Rede respondeu HTTP ${res.status}.` };
    // a consulta devolve { authorization: {...} } ou os campos na raiz
    const data = body.authorization || body;
    const code = data.returnCode != null ? String(data.returnCode) : "";
    const status = String(data.status || body.status || "").toLowerCase();
    return {
      found: true,
      approved: code === "00",
      // autenticação 3DS ainda não concluída pelo cliente
      pending: code === "220" || status === "pending",
      payment: {
        tid: data.tid || body.tid || "",
        nsu: data.nsu || "",
        authorizationCode: data.authorizationCode || "",
        returnCode: code,
        returnMessage: data.returnMessage || "",
      },
    };
  } catch {
    return { error: "Não foi possível falar com a Rede agora." };
  }
}
