import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";

export async function GET() {
  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(request) {
  const data = await request.json().catch(() => null);
  if (!data) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const settings = updateSettings(data);
  return NextResponse.json({ settings });
}
