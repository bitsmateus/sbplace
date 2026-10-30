import { NextResponse } from "next/server";
import { deleteLead, updateLeadStatus } from "@/lib/leads";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const data = await request.json().catch(() => null);
  const lead = updateLeadStatus(id, data?.status);
  if (!lead) return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  if (!deleteLead(id)) return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
