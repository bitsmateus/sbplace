import { NextResponse } from "next/server";
import { getNotificationSettings, saveNotificationSettings } from "@/lib/notifications";
import { isNxConfigured } from "@/lib/nx";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ settings: getNotificationSettings(), nxReady: isNxConfigured() });
}

export async function PUT(request) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  return NextResponse.json({ settings: saveNotificationSettings(data) });
}
