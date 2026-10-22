import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/orders";
import { requestOrigin, resolvePendingOrder } from "@/lib/checkout";

export const dynamic = "force-dynamic";

// Para onde o banco devolve o cliente depois da autenticação 3D Secure (a Rede
// pode chamar por GET ou POST). O resultado NÃO vem desta URL: o pedido é
// conferido direto na Rede, e o cliente segue para a página do pedido.
async function handle(request) {
  const token = new URL(request.url).searchParams.get("pedido") || "";
  const order = getOrderByToken(token);
  const origin = requestOrigin(request) || new URL(request.url).origin;
  if (!order) return NextResponse.redirect(`${origin}/`, 303);

  await resolvePendingOrder(order.id);
  return NextResponse.redirect(`${origin}/pedido/${encodeURIComponent(order.token)}`, 303);
}

export const GET = handle;
export const POST = handle;
