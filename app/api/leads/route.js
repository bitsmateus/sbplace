import { NextResponse } from "next/server";
import { createLead, normalizePhone } from "@/lib/leads";

export const dynamic = "force-dynamic";

// Formulário rápido do site (nome + WhatsApp). Rota pública.
// Proteção simples contra robô: campo escondido "empresa" (pessoa não vê,
// robô preenche) e no máximo 5 envios por IP a cada 10 minutos.
const JANELA_MS = 10 * 60 * 1000;
const MAX_POR_JANELA = 5;
const envios = new Map();

function limiteEstourado(ip) {
  const agora = Date.now();
  const lista = (envios.get(ip) || []).filter((t) => agora - t < JANELA_MS);
  lista.push(agora);
  envios.set(ip, lista);
  if (envios.size > 5000) envios.clear();
  return lista.length > MAX_POR_JANELA;
}

export async function POST(request) {
  const data = await request.json().catch(() => null);
  if (!data) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  // robô: finge que deu certo e não grava nada
  if (data.empresa) return NextResponse.json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (limiteEstourado(ip)) {
    return NextResponse.json({ error: "Muitos envios. Tente de novo em alguns minutos." }, { status: 429 });
  }

  const name = String(data.name || "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Digite seu nome." }, { status: 400 });
  }
  if (!normalizePhone(data.phone)) {
    return NextResponse.json({ error: "Confira o WhatsApp com DDD." }, { status: 400 });
  }

  createLead({
    name,
    phone: data.phone,
    page: data.page,
    pageTitle: data.pageTitle,
    origem: data.origem,
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
