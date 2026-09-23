import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { DATA_DIR } from "@/lib/db";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

export async function POST(request) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "Nenhum arquivo enviado." },
      { status: 400 }
    );
  }

  if (!ALLOWED[file.type]) {
    return NextResponse.json(
      { error: "Formato não suportado. Use JPG, PNG, WEBP ou AVIF." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máximo 8MB)." },
      { status: 400 }
    );
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const ext = ALLOWED[file.type];
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);

  return NextResponse.json({ filename });
}
