import { NextResponse } from "next/server";
import { getLinkByToken, linkEffectiveStatus } from "@/lib/links";
import { reserveLinkAndCreateOrder } from "@/lib/orders";
import { isRedeConfigured } from "@/lib/rede";
import {
  browserInfo,
  chargeOrder,
  clientIp,
  releaseStaleReservation,
  requestOrigin,
  tooManyAttempts,
  validate,
} from "@/lib/checkout";

export const dynamic = "force-dynamic";

// Pagamento de um link manual. Valor e regras vêm do link gravado no servidor.
export async function POST(request, { params }) {
  const { token } = await params;

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

  let link = getLinkByToken(token);
  if (!link) return NextResponse.json({ error: "Link de pagamento não encontrado." }, { status: 404 });
  if (link.status === "em_uso") {
    await releaseStaleReservation({ linkId: link.id });
    link = getLinkByToken(token);
  }
  if (linkEffectiveStatus(link) !== "ativo") {
    return NextResponse.json({ error: "Este link de pagamento não está mais disponível." }, { status: 409 });
  }

  const valid = validate(data, {
    maxInstallments: link.maxInstallments,
    requireAddress: link.requireAddress,
  });
  if (valid.error) return NextResponse.json({ error: valid.error }, { status: 400 });

  if (tooManyAttempts(clientIp(request))) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos ou fale com a gente pelo WhatsApp." },
      { status: 429 }
    );
  }

  const reserved = reserveLinkAndCreateOrder({
    token: link.token,
    customer: valid.customer,
    address: link.requireAddress ? valid.address : {},
    installments: valid.installments,
    siteUrl: requestOrigin(request),
  });
  if (reserved.error) return NextResponse.json({ error: reserved.error }, { status: 409 });

  const { status, body } = await chargeOrder(reserved.order, valid.card, browserInfo(request, data));
  return NextResponse.json(body, { status });
}
