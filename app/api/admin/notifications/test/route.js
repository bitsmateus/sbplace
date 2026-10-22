import { NextResponse } from "next/server";
import { sendTestNotification } from "@/lib/notifications";
import { isNxConfigured } from "@/lib/nx";
import { requestOrigin } from "@/lib/checkout";

export const dynamic = "force-dynamic";

// Envia o template de um evento, com dados fictícios, para o número informado.
export async function POST(request) {
  if (!isNxConfigured()) {
    return NextResponse.json(
      { error: "Configure NX_API_URL, NX_API_ID e NX_API_TOKEN no servidor." },
      { status: 503 }
    );
  }
  const data = await request.json().catch(() => null);
  const phone = String(data?.phone || "").replace(/\D/g, "");
  if (phone.length < 10) {
    return NextResponse.json({ error: "Informe um WhatsApp com DDD." }, { status: 400 });
  }
  const result = await sendTestNotification(String(data?.event || ""), phone, requestOrigin(request));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true, ticketId: result.ticketId ?? null });
}
