import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { DATA_DIR } from "@/lib/db";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const MAX_SIZE = 20 * 1024 * 1024; // 20MB (fotos de celular são grandes)
const MAX_EDGE = 2000; // px do maior lado depois de otimizar
const ALLOWED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

// Reduz e converte para WebP: foto de 8 MB vira ~300 KB, o site carrega muito
// mais rápido. Se algo falhar, salva o arquivo original sem otimizar.
async function optimize(buffer) {
  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(buffer)
      .rotate() // respeita a orientação da câmera
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { buffer: out, ext: ".webp" };
  } catch {
    return null;
  }
}

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
      { error: "Arquivo muito grande (máximo 20MB)." },
      { status: 400 }
    );
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const original = Buffer.from(await file.arrayBuffer());
  const optimized = await optimize(original);
  const buffer = optimized?.buffer || original;
  const ext = optimized?.ext || ALLOWED[file.type];

  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);

  return NextResponse.json({ filename });
}
