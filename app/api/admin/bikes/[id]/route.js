import { NextResponse } from "next/server";
import { getBikeById, updateBike, deleteBike } from "@/lib/bikes";
import { removeUploadFile } from "@/lib/upload-files";

export async function GET(request, { params }) {
  const { id } = await params;
  const bike = getBikeById(Number(id));
  if (!bike) {
    return NextResponse.json({ error: "Não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ bike });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const data = await request.json().catch(() => null);
  if (!data) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const before = getBikeById(Number(id));
  const bike = updateBike(Number(id), {
    name: data.name,
    category: data.category,
    condition: data.condition,
    subtitle: data.subtitle,
    installments:
      data.installments !== undefined
        ? Math.max(0, Math.round(Number(data.installments) || 0))
        : undefined,
    installmentValueCents:
      data.installmentValueCents !== undefined
        ? Math.max(0, Math.round(Number(data.installmentValueCents) || 0))
        : undefined,
    cashPriceCents:
      data.cashPriceCents !== undefined
        ? Math.round(Number(data.cashPriceCents) || 0)
        : undefined,
    priceCents:
      data.priceCents !== undefined
        ? Math.round(Number(data.priceCents) || 0)
        : undefined,
    description: data.description,
    specs: data.specs,
    status: data.status,
    featured: data.featured !== undefined ? !!data.featured : undefined,
    images: Array.isArray(data.images) ? data.images : undefined,
    position: data.position !== undefined ? Number(data.position) : undefined,
  });

  if (!bike) {
    return NextResponse.json({ error: "Não encontrada." }, { status: 404 });
  }

  // apaga do disco as fotos que foram removidas desta bike
  for (const img of before?.images || []) {
    if (!bike.images.includes(img)) {
      removeUploadFile(img);
    }
  }

  return NextResponse.json({ bike });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const bike = getBikeById(Number(id));
  if (bike) {
    // best-effort cleanup of the bike's uploaded images
    for (const img of bike.images || []) removeUploadFile(img);
  }
  deleteBike(Number(id));
  return NextResponse.json({ ok: true });
}
