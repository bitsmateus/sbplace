import { NextResponse } from "next/server";
import { getBikeBySlug } from "@/lib/bikes";
import { installmentInfo } from "@/lib/bike-constants";
import { MAX_ONLINE_INSTALLMENTS } from "@/lib/order-constants";
import { reserveBikeAndCreateOrder } from "@/lib/orders";
import { isRedeConfigured } from "@/lib/rede";
import { chargeOrder, clientIp, str, tooManyAttempts, validate } from "@/lib/checkout";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!isRedeConfigured()) {
    return NextResponse.json(
      { error: "O pagamento online está indisponível no momento. Fale com a gente pelo WhatsApp." },
      { status: 503 }
    );
  }

  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const bike = getBikeBySlug(str(data.slug, 200));
  if (!bike || bike.status === "oculta") {
    return NextResponse.json({ error: "Bicicleta não encontrada." }, { status: 404 });
  }
  if ((bike.condition || "nova") !== "seminova") {
    return NextResponse.json({ error: "Esta bike é vendida somente na loja." }, { status: 400 });
  }

  const maxInstallments = Math.min(installmentInfo(bike).count, MAX_ONLINE_INSTALLMENTS);
  const valid = validate(data, { maxInstallments });
  if (valid.error) return NextResponse.json({ error: valid.error }, { status: 400 });

  if (tooManyAttempts(clientIp(request))) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos ou fale com a gente pelo WhatsApp." },
      { status: 429 }
    );
  }

  // O valor vem sempre do catálogo (nunca do navegador).
  const reserved = reserveBikeAndCreateOrder({
    bikeId: bike.id,
    customer: valid.customer,
    address: valid.address,
    installments: valid.installments,
  });
  if (reserved.error) {
    return NextResponse.json({ error: reserved.error }, { status: 409 });
  }

  const { status, body } = await chargeOrder(reserved.order, valid.card);
  return NextResponse.json(body, { status });
}
