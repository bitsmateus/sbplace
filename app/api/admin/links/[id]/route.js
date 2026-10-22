import { NextResponse } from "next/server";
import { cancelLink, effectiveLink } from "@/lib/links";

export const dynamic = "force-dynamic";

// Cancela (desativa) o link: quem abrir depois vê "link indisponível".
export async function DELETE(request, { params }) {
  const { id } = await params;
  const result = cancelLink(id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ link: effectiveLink(result.link) });
}
