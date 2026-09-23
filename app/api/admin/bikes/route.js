import { NextResponse } from "next/server";
import { listBikes, createBike } from "@/lib/bikes";

export async function GET() {
  const bikes = listBikes({});
  return NextResponse.json({ bikes });
}

export async function POST(request) {
  const data = await request.json().catch(() => null);
  if (!data || !data.name) {
    return NextResponse.json(
      { error: "Nome da bicicleta é obrigatório." },
      { status: 400 }
    );
  }

  const bike = createBike({
    name: data.name,
    category: data.category,
    condition: data.condition,
    subtitle: data.subtitle,
    priceCents: Math.round(Number(data.priceCents) || 0),
    cashPriceCents: Math.round(Number(data.cashPriceCents) || 0),
    installments: Math.max(0, Math.round(Number(data.installments) || 0)),
    installmentValueCents: Math.max(
      0,
      Math.round(Number(data.installmentValueCents) || 0)
    ),
    description: data.description,
    specs: data.specs,
    status: data.status,
    featured: !!data.featured,
    images: Array.isArray(data.images) ? data.images : [],
    position: Number(data.position) || 0,
  });

  return NextResponse.json({ bike }, { status: 201 });
}
