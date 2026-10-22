import { NextResponse } from "next/server";
import {
  applyPaymentResult,
  cancelOrder,
  deleteOrder,
  getOrderById,
  markDelivered,
  markShipped,
  orderCode,
  saveOrderNotes,
  updateOrderDetails,
} from "@/lib/orders";
import { isValidCpf, isValidEmail, onlyDigits } from "@/lib/order-constants";
import { findTransactionByReference } from "@/lib/rede";

export const dynamic = "force-dynamic";

const str = (v, max) => String(v ?? "").trim().slice(0, max);

// Valida a edição feita no painel. Endereço só é exigido se o pedido já tinha.
function validateEdit(data, order) {
  const c = data.customer || {};
  const customer = {
    name: str(c.name, 120),
    cpf: onlyDigits(c.cpf),
    email: str(c.email, 120).toLowerCase(),
    phone: onlyDigits(c.phone),
  };
  if (customer.name.length < 3) return { error: "Informe o nome do cliente." };
  if (!isValidCpf(customer.cpf)) return { error: "CPF inválido." };
  if (!isValidEmail(customer.email)) return { error: "E-mail inválido." };
  if (customer.phone.length < 10 || customer.phone.length > 13) return { error: "Telefone inválido." };

  let address;
  if (data.address) {
    const a = data.address;
    address = {
      cep: onlyDigits(a.cep),
      street: str(a.street, 120),
      number: str(a.number, 20),
      complement: str(a.complement, 80),
      district: str(a.district, 80),
      city: str(a.city, 80),
      state: str(a.state, 2).toUpperCase(),
    };
    const any = Object.values(address).some(Boolean);
    const required = Boolean(order.address?.street) || any;
    if (!required) {
      address = undefined;
    } else {
      if (address.cep.length !== 8) return { error: "CEP inválido." };
      if (!address.street || !address.number || !address.district || !address.city || address.state.length !== 2) {
        return { error: "Preencha o endereço completo." };
      }
    }
  }
  return { customer, address };
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const result = deleteOrder(id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function GET(request, { params }) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  return NextResponse.json({ order });
}

// Ações do pedido: { action: "ship" | "deliver" | "cancel" | "edit" | "notes" | "recheck", ... }
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
    case "edit": {
      const valid = validateEdit(data, order);
      if (valid.error) return NextResponse.json({ error: valid.error }, { status: 400 });
      result = updateOrderDetails(id, valid);
      break;
    }
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
