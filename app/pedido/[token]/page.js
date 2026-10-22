import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getOrderByToken, orderCode } from "@/lib/orders";
import { formatPrice } from "@/lib/bike-constants";
import { whatsappLink } from "@/lib/site-config";
import { refreshWaitingOrder } from "@/lib/checkout";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Seu pedido | SB Place",
  robots: { index: false },
};

const STEPS = [
  { key: "pago", label: "Pagamento confirmado" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
];

const MESSAGES = {
  pago: "Pagamento confirmado! Estamos preparando sua bike para o envio.",
  enviado: "Sua bike foi enviada.",
  entregue: "Pedido entregue. Aproveite a bike!",
  verificar_pagamento:
    "Estamos confirmando o seu pagamento com o banco. Não precisa pagar de novo: assim que confirmar, a equipe entra em contato.",
  aguardando_pagamento: "Estamos processando o seu pagamento. Atualize a página em instantes.",
  autenticando:
    "Confirme a compra no app ou no site do seu banco. Assim que o banco confirmar, esta página atualiza sozinha.",
  recusado: "O pagamento não foi aprovado e nada foi cobrado. Você pode tentar novamente com outro cartão.",
  cancelado: "Este pedido foi cancelado.",
};

export default async function PedidoPage({ params }) {
  const { token } = await params;
  let order = getOrderByToken(token);
  if (!order) notFound();

  // Pagamento esperando a autenticação do banco (3DS): confere na Rede
  order = (await refreshWaitingOrder(order)) || order;
  const stillWaiting = order.status === "aguardando_pagamento";

  const reached = { pago: 1, enviado: 2, entregue: 3 }[order.status] || 0;
  const bad = order.status === "recusado" || order.status === "cancelado";
  const code = orderCode(order);
  const help = whatsappLink(`Olá! Sobre o meu pedido ${code} (${order.bikeName}) no site da SB Place.`);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page max-w-2xl py-10 md:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Pedido {code}</p>
          <h1 className="display mt-2 text-4xl text-ink md:text-5xl">
            {bad
              ? "Pedido não concluído"
              : order.status === "verificar_pagamento" || stillWaiting
                ? "Quase lá"
                : "Compra realizada"}
          </h1>
          <p className="mt-4 text-lg text-stone">
            {stillWaiting && order.payment?.threeDSPendingSince ? MESSAGES.autenticando : MESSAGES[order.status]}
          </p>
          {stillWaiting && <AutoRefresh />}

          {reached > 0 && (
            <ol className="mt-8 grid grid-cols-3 gap-2 text-center text-sm">
              {STEPS.map((s, i) => (
                <li
                  key={s.key}
                  className={`rounded-xl border px-2 py-3 ${
                    i < reached ? "border-ink bg-ink font-semibold text-paper" : "border-hairline text-stone"
                  }`}
                >
                  {s.label}
                </li>
              ))}
            </ol>
          )}

          {order.status === "enviado" && (order.shipping.carrier || order.shipping.trackingCode) && (
            <p className="mt-4 rounded-xl bg-bone p-4 text-[15px] text-ink">
              {order.shipping.carrier && <>Transportadora: <strong>{order.shipping.carrier}</strong><br /></>}
              {order.shipping.trackingCode && <>Código de rastreio: <strong>{order.shipping.trackingCode}</strong></>}
            </p>
          )}

          <div className="mt-8 rounded-2xl border border-hairline bg-bone p-5 text-[15px]">
            <p className="font-semibold text-ink">{order.bikeName}</p>
            <p className="mt-1 text-stone">
              {formatPrice(order.amountCents)} em {order.installments}x no cartão
              {order.payment.cardLast4 ? ` final ${order.payment.cardLast4}` : ""}
              {order.source === "link" ? "" : " · frete grátis"}
            </p>
            {order.address?.street && (
              <p className="mt-3 text-stone">
                Entrega em: {order.address.street}, {order.address.number}
                {order.address.complement ? ` — ${order.address.complement}` : ""} — {order.address.district},{" "}
                {order.address.city}/{order.address.state}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={help}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 font-semibold text-paper transition hover:bg-accent hover:text-ink"
            >
              Falar com a equipe no WhatsApp
            </a>
            <Link
              href={
                order.status === "recusado"
                  ? order.source === "link"
                    ? `/pagar/${order.linkToken}`
                    : `/comprar/${order.bikeSlug}`
                  : order.source === "link"
                    ? "/"
                    : "/catalogo?condicao=seminova"
              }
              className="inline-flex h-12 items-center justify-center rounded-full border border-hairline px-8 font-semibold text-ink transition hover:border-ink"
            >
              {order.status === "recusado"
                ? "Tentar novamente"
                : order.source === "link"
                  ? "Ir para o site"
                  : "Ver outras seminovas"}
            </Link>
          </div>
          <p className="mt-6 text-sm text-stone">Guarde este link: é por ele que você acompanha o pedido.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
