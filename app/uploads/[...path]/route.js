import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/db";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(request, { params }) {
  const { path: segments } = await params;
  const relPath = segments.join("/");

  // prevent path traversal
  const resolved = path.normalize(path.join(UPLOADS_DIR, relPath));
  if (!resolved.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
  }

  if (!fs.existsSync(resolved)) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const file = fs.readFileSync(resolved);

  return new NextResponse(file, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
