import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getBikeById, createBike } from "@/lib/bikes";
import { DATA_DIR } from "@/lib/db";

// Duplica uma bike (útil para modelos parecidos). As fotos são COPIADAS em
// arquivos novos, para que apagar uma bike nunca apague a foto da outra.
// A cópia nasce como "oculta" até a loja revisar e publicar.
export async function POST(request, { params }) {
  const { id } = await params;
  const source = getBikeById(Number(id));
  if (!source) {
    return NextResponse.json({ error: "Não encontrada." }, { status: 404 });
  }

  const uploads = path.join(DATA_DIR, "uploads");
  const images = [];
  for (const img of source.images || []) {
    const from = path.join(uploads, path.basename(img));
    if (!fs.existsSync(from)) continue;
    const ext = path.extname(img) || ".jpg";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    fs.copyFileSync(from, path.join(uploads, name));
    images.push(name);
  }

  const copy = createBike({
    name: `${source.name} (cópia)`,
    category: source.category,
    condition: source.condition,
    subtitle: source.subtitle,
    priceCents: source.priceCents,
    cashPriceCents: source.cashPriceCents,
    installments: source.installments,
    installmentValueCents: source.installmentValueCents,
    description: source.description,
    specs: source.specs,
    status: "oculta",
    featured: false,
    images,
    position: source.position,
  });

  return NextResponse.json({ bike: copy }, { status: 201 });
}
