// Cliente da API da NX (Z-PRO) para enviar templates oficiais do WhatsApp
// (WABA). Credenciais só em variáveis de ambiente:
//   NX_API_URL   endereço do backend da NX (com ou sem https://)
//   NX_API_ID    ID da API/canal criado na NX
//   NX_API_TOKEN token Bearer da API
//
// Endpoint (coleção Postman "Z-PRO v4"): POST /v2/api/external/{ApiID}/template

const TIMEOUT_MS = 20_000;

function settings() {
  let base = String(process.env.NX_API_URL || "").trim().replace(/\/+$/, "");
  if (base && !/^https?:\/\//i.test(base)) base = `https://${base}`;
  return {
    base,
    apiId: String(process.env.NX_API_ID || "").trim(),
    token: String(process.env.NX_API_TOKEN || "").trim(),
  };
}

export function isNxConfigured() {
  const { base, apiId, token } = settings();
  return Boolean(base && apiId && token);
}

// Número brasileiro com DDI. A loja guarda só DDD + número.
export function whatsappNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

// A Meta recusa parâmetro vazio, com quebra de linha/tab ou com mais de 4
// espaços seguidos.
function cleanParam(value) {
  const text = String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {4,}/g, "   ")
    .trim();
  return (text || "—").slice(0, 1000);
}

// Envia um template aprovado. Devolve { ok, ticketId } ou { ok: false, error }.
export async function sendTemplate({ phone, templateName, language, params, closeTicket }) {
  const cfg = settings();
  if (!isNxConfigured()) return { ok: false, error: "API da NX não configurada (NX_API_URL, NX_API_ID, NX_API_TOKEN)." };

  const number = whatsappNumber(phone);
  if (number.length < 12) return { ok: false, error: "Telefone do cliente inválido." };

  const template = {
    name: templateName,
    language: { code: language || "pt_BR" },
  };
  if (params?.length) {
    template.components = [
      { type: "body", parameters: params.map((p) => ({ type: "text", text: cleanParam(p) })) },
    ];
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${cfg.base}/v2/api/external/${encodeURIComponent(cfg.apiId)}/template`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.token}` },
      body: JSON.stringify({
        number,
        isClosed: Boolean(closeTicket),
        // WABA: usa o número como enviado (evita ticket duplicado pelo 9º dígito)
        validateNumber: false,
        templateData: {
          messaging_product: "whatsapp",
          to: number,
          type: "template",
          template,
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.success !== false) {
      return { ok: true, ticketId: data?.data?.ticketId ?? null };
    }
    let why = data?.error || data?.message || data?.data?.message || "";
    if (why && typeof why === "object") why = JSON.stringify(why);
    return { ok: false, error: `NX respondeu HTTP ${res.status}${why ? `: ${String(why).slice(0, 200)}` : ""}` };
  } catch (err) {
    return { ok: false, error: err.name === "AbortError" ? "A NX não respondeu a tempo." : "Erro de conexão com a NX." };
  } finally {
    clearTimeout(timer);
  }
}
