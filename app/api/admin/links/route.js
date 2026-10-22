import { NextResponse } from "next/server";
import { createLink, effectiveLink, listLinks } from "@/lib/links";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ links: listLinks().map(effectiveLink) });
}

export async function POST(request) {
  const data = await request.json().catch(() => null);
  if (!data) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const description = String(data.description || "").trim();
  const amountCents = Math.round(Number(data.amountCents) || 0);
  if (description.length < 3) {
    return NextResponse.json({ error: "Descreva o que está sendo cobrado." }, { status: 400 });
  }
  // mínimo de R$ 1,00 e teto de R$ 500.000,00 para pegar erro de digitação
  if (amountCents < 100 || amountCents > 50_000_000) {
    return NextResponse.json({ error: "Informe um valor entre R$ 1,00 e R$ 500.000,00." }, { status: 400 });
  }

  const link = createLink({
    description,
    amountCents,
    maxInstallments: data.maxInstallments,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    requireAddress: data.requireAddress,
    expiresInDays: data.expiresInDays,
  });
  return NextResponse.json({ link: effectiveLink(link) }, { status: 201 });
}
