import { NextResponse } from "next/server";
import {
  applyPaymentResult,
  cancelOrder,
  getOrderById,
  markDelivered,
  markShipped,
  orderCode,
  saveOrderNotes,
} from "@/lib/orders";
import { findTransactionByReference } from "@/lib/rede";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ order });
}

// Ações do pedido: { action: "ship" | "deliver" | "cancel" | "notes" | "recheck", ... }
export async function PATCH(request, { params }) {
  const { id } = await params;
  const data = await request.json().catch(() => null);
  if (!data?.action) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const order = getOrderById(id);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  let result;
  switch (data.action) {
    case "ship":
      result = markShipped(id, { carrier: data.carrier, trackingCode: data.trackingCode });
      break;
    case "deliver":
      result = markDelivered(id);
      break;
    case "cancel":
      result = cancelOrder(id, data.reason);
      break;
    case "notes":
      result = { order: saveOrderNotes(id, data.notes) };
      break;
    case "recheck": {
      if (order.status !== "verificar_pagamento" && order.status !== "aguardando_pagamento") {
        return NextResponse.json({ error: "Este pedido não precisa de conferência." }, { status: 400 });
      }
      const found = await findTransactionByReference(orderCode(order));
      if (found.error) return NextResponse.json({ error: found.error }, { status: 502 });
      if (!found.found) {
        return NextResponse.json(
          { error: "A Rede não tem nenhuma cobrança com a referência deste pedido." },
          { status: 404 }
        );
      }
      result = {
        order: applyPaymentResult(id, {
          outcome: found.approved ? "approved" : "declined",
          payment: found.payment,
          message: found.approved
            ? "Pagamento confirmado na consulta à Rede."
            : `Consulta à Rede: não aprovado${found.payment.returnMessage ? ` (${found.payment.returnMessage})` : ""}.`,
        }),
      };
      break;
    }
    default:
      return NextResponse.json({ error: "Ação desconhecida." }, { status: 400 });
  }

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ order: result.order });
}
