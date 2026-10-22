import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { countOrdersByStatus, listOrders, orderCode } from "@/lib/orders";
import { ORDER_STATUS } from "@/lib/order-constants";
import { formatPrice } from "@/lib/bike-constants";
import { isRedeConfigured, redeEnvironment } from "@/lib/rede";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pedidos — painel SB Place" };

function formatDate(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default async function PedidosPage({ searchParams }) {
  const { status } = await searchParams;
  const filter = ORDER_STATUS.some((s) => s.value === status) ? status : "";
  const orders = listOrders({ status: filter });
  const counts = countOrdersByStatus();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const toShip = counts.pago || 0;
  const toCheck = counts.verificar_pagamento || 0;

  const tabs = [
    { value: "", label: "Todos", count: total },
    ...ORDER_STATUS.map((s) => ({ value: s.value, label: s.label, count: counts[s.value] || 0 })),
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Pedidos</h1>
      <p className="mt-1 text-sm text-mist">
        Compras feitas pelo site. Acompanhe o pagamento e marque como enviado e entregue.
      </p>

      {!isRedeConfigured() && (
        <p className="mt-6 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          O pagamento online está <strong>desligado</strong>: faltam as variáveis{" "}
          <code>REDE_PV</code> e <code>REDE_TOKEN</code> no servidor. Enquanto isso, o site
          continua levando o cliente para o WhatsApp.
        </p>
      )}
      {isRedeConfigured() && redeEnvironment() === "sandbox" && (
        <p className="mt-6 rounded-xl border border-sky-400/40 bg-sky-400/10 p-4 text-sm text-sky-200">
          A Rede está em modo de <strong>teste (sandbox)</strong>: nenhuma cobrança é real. Para
          vender de verdade, defina <code>REDE_ENV=production</code>.
        </p>
      )}

      {(toShip > 0 || toCheck > 0) && (
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {toShip > 0 && (
            <Link
              href="/admin/pedidos?status=pago"
              className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-emerald-200 transition hover:bg-emerald-400/20"
            >
              <strong>{toShip}</strong> {toShip === 1 ? "pedido pago para enviar" : "pedidos pagos para enviar"}
            </Link>
          )}
          {toCheck > 0 && (
            <Link
              href="/admin/pedidos?status=verificar_pagamento"
              className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-amber-200 transition hover:bg-amber-400/20"
            >
              <strong>{toCheck}</strong> {toCheck === 1 ? "pagamento para conferir" : "pagamentos para conferir"}
            </Link>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        {tabs.map((t) => {
          const active = t.value === filter;
          return (
            <Link
              key={t.value || "todos"}
              href={t.value ? `/admin/pedidos?status=${t.value}` : "/admin/pedidos"}
              className={`rounded-full border px-4 py-2 transition ${
                active
                  ? "border-paper bg-paper text-ink font-semibold"
                  : "border-line text-mist hover:text-paper"
              }`}
            >
              {t.label} <span className="opacity-60">{t.count}</span>
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-xl border border-line bg-ink-soft p-8 text-center text-sm text-mist">
          Nenhum pedido {filter ? "com esse status" : "ainda"}.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/pedidos/${o.id}`}
                className="flex flex-col gap-3 rounded-xl border border-line bg-ink-soft p-4 transition hover:border-mist sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm text-fog">
                    <span className="font-semibold text-paper">{orderCode(o)}</span> · {formatDate(o.createdAt)}
                  </p>
                  <p className="mt-1 truncate font-medium text-paper">{o.bikeName}</p>
                  <p className="truncate text-sm text-mist">
                    {o.customer.name}
                    {o.address?.city ? ` · ${o.address.city}/${o.address.state}` : ""}
                    {o.source === "link" ? " · link de pagamento" : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                  <span className="font-semibold text-paper">{formatPrice(o.amountCents)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
