import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/db";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const CACHE_DIR = path.join(DATA_DIR, "cache");

// Larguras permitidas em /uploads/arquivo.webp?w=480 (evita gerar infinitas
// variações). Cada uma é criada uma vez e guardada em DATA_DIR/cache.
const WIDTHS = [160, 320, 480, 640, 800, 1200, 1600];
const RESIZABLE = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

// Nomes de arquivo são únicos (timestamp + aleatório) e nunca mudam, então o
// navegador pode guardar por 1 ano.
const CACHE_HEADERS = { "Cache-Control": "public, max-age=31536000, immutable" };

async function resized(file, width) {
  const base = path.basename(file, path.extname(file));
  const cached = path.join(CACHE_DIR, `${width}-${base}.webp`);
  try {
    return await fs.promises.readFile(cached);
  } catch {}
  try {
    const sharp = (await import("sharp")).default;
    // lê o arquivo para a memória (não deixa o arquivo aberto/travado durante o processamento)
    const input = await fs.promises.readFile(file);
    const out = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    await fs.promises.mkdir(CACHE_DIR, { recursive: true });
    // grava em arquivo temporário e renomeia (nunca deixa arquivo pela metade)
    const tmp = `${cached}.${process.pid}.tmp`;
    await fs.promises.writeFile(tmp, out);
    await fs.promises.rename(tmp, cached);
    return out;
  } catch {
    return null; // sem sharp ou imagem inválida: cai no arquivo original
  }
}

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

  const w = Number(new URL(request.url).searchParams.get("w"));
  if (w && WIDTHS.includes(w) && RESIZABLE.has(ext)) {
    const out = await resized(resolved, w);
    if (out) {
      return new NextResponse(out, {
        headers: { "Content-Type": "image/webp", ...CACHE_HEADERS },
      });
    }
  }

  const file = await fs.promises.readFile(resolved);
  return new NextResponse(file, {
    headers: {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      ...CACHE_HEADERS,
    },
  });
}
