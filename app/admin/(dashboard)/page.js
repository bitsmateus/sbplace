import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { getDashboard } from "@/lib/dashboard";
import { orderCode } from "@/lib/orders";
import { formatPrice } from "@/lib/bike-constants";
import { isRedeConfigured, redeEnvironment } from "@/lib/rede";

export const dynamic = "force-dynamic";

export const metadata = { title: "Início — painel SB Place" };

const card = "rounded-xl border border-line bg-ink-soft p-5";

function Kpi({ label, value, hint, tone }) {
  return (
    <div className={card}>
      <p className="text-xs uppercase tracking-wide text-fog">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-paper">{value}</p>
      {hint && <p className={`mt-1 text-xs ${tone || "text-mist"}`}>{hint}</p>}
    </div>
  );
}

function TodoCard({ href, count, label, tone }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-xl border p-4 transition hover:brightness-125 ${tone}`}
    >
      <span className="text-3xl font-semibold tabular-nums">{count}</span>
      <span className="text-sm leading-snug">{label}</span>
    </Link>
  );
}

function StockCard({ title, data, href }) {
  const rows = [
    ["Reservadas", data.reserved],
    ["Vendidas", data.sold],
    ["Ocultas", data.hidden],
  ];
  return (
    <div className={card}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-paper">{title}</h3>
        <Link href={href} className="text-xs text-mist transition hover:text-paper">
          Ver todas →
        </Link>
      </div>
      <p className="mt-3 text-4xl font-semibold tabular-nums text-paper">{data.available}</p>
      <p className="text-sm text-mist">
        {data.available === 1 ? "disponível no site" : "disponíveis no site"}
      </p>
      <p className="mt-3 text-sm text-mist">
        Valor em estoque: <strong className="text-paper">{formatPrice(data.availableValueCents)}</strong>
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
        {rows.map(([label, n]) => (
          <div key={label}>
            <dt className="text-xs text-fog">{label}</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-paper">{n}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function AdminHomePage() {
  const { finance, todo, stock, recentOrders } = getDashboard();
  const max = Math.max(...finance.months.map((m) => m.cents), 1);
  const hasTodo = todo.toShip || todo.toCheck || todo.inTransit || todo.activeLinks;

  let changeHint = "Sem vendas no mês passado para comparar";
  let changeTone;
  if (finance.changePct !== null) {
    changeHint = `${finance.changePct >= 0 ? "+" : ""}${finance.changePct}% vs. mês passado (${formatPrice(finance.lastMonthCents)})`;
    changeTone = finance.changePct >= 0 ? "text-emerald-300" : "text-red-300";
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Início</h1>
          <p className="mt-1 text-sm text-mist">Resumo das vendas online, do estoque e do que precisa de atenção.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/bicicletas/nova"
            className="inline-flex h-11 items-center justify-center rounded-full bg-paper px-5 text-sm font-semibold text-ink transition hover:bg-gold"
          >
            + Nova bicicleta
          </Link>
          <Link
            href="/admin/links"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm text-mist transition hover:text-paper"
          >
            + Link de pagamento
          </Link>
        </div>
      </div>

      {!isRedeConfigured() ? (
        <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-200">
          Pagamento online desligado: configure <code>REDE_PV</code> e <code>REDE_TOKEN</code> no servidor.
        </p>
      ) : redeEnvironment() === "sandbox" ? (
        <p className="rounded-xl border border-sky-400/40 bg-sky-400/10 p-4 text-sm text-sky-200">
          A Rede está em modo de teste (sandbox): nenhuma cobrança é real.
        </p>
      ) : null}

      {hasTodo ? (
        <section>
          <h2 className="text-lg font-semibold text-paper">Precisa de atenção</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {todo.toShip > 0 && (
              <TodoCard
                href="/admin/pedidos?status=pago"
                count={todo.toShip}
                label={todo.toShip === 1 ? "pedido pago para enviar" : "pedidos pagos para enviar"}
                tone="border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
              />
            )}
            {todo.toCheck > 0 && (
              <TodoCard
                href="/admin/pedidos?status=verificar_pagamento"
                count={todo.toCheck}
                label={todo.toCheck === 1 ? "pagamento para conferir na Rede" : "pagamentos para conferir na Rede"}
                tone="border-amber-400/40 bg-amber-400/10 text-amber-200"
              />
            )}
            {todo.inTransit > 0 && (
              <TodoCard
                href="/admin/pedidos?status=enviado"
                count={todo.inTransit}
                label={todo.inTransit === 1 ? "pedido a caminho do cliente" : "pedidos a caminho do cliente"}
                tone="border-sky-400/40 bg-sky-400/10 text-sky-200"
              />
            )}
            {todo.activeLinks > 0 && (
              <TodoCard
                href="/admin/links"
                count={todo.activeLinks}
                label={`${todo.activeLinks === 1 ? "link aguardando pagamento" : "links aguardando pagamento"} (${formatPrice(todo.activeLinksCents)})`}
                tone="border-line bg-ink-soft text-mist"
              />
            )}
          </div>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-paper">Financeiro</h2>
          <p className="text-xs text-fog">Vendas pagas pelo site e por link (vendas no balcão não entram).</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Vendido este mês" value={formatPrice(finance.monthCents)} hint={changeHint} tone={changeTone} />
          <Kpi
            label="Vendas no mês"
            value={finance.monthCount}
            hint={`Site ${formatPrice(finance.monthFromSiteCents)} · Links ${formatPrice(finance.monthFromLinksCents)}`}
          />
          <Kpi label="Ticket médio do mês" value={formatPrice(finance.avgTicketCents)} />
          <Kpi
            label="Total vendido online"
            value={formatPrice(finance.totalCents)}
            hint={`${finance.totalCount} ${finance.totalCount === 1 ? "venda" : "vendas"} desde o início`}
          />
        </div>

        <div className={`${card} mt-3`}>
          <p className="text-xs uppercase tracking-wide text-fog">Últimos 6 meses</p>
          <div className="mt-4 flex h-44 items-end gap-2 sm:gap-4" role="img" aria-label="Vendas por mês nos últimos 6 meses">
            {finance.months.map((m) => (
              <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[11px] tabular-nums text-mist">
                  {m.cents ? formatPrice(m.cents).replace(/,\d{2}$/, "") : ""}
                </span>
                <div
                  className={`w-full max-w-14 rounded-t-md ${m.current ? "bg-gold" : "bg-paper/25"}`}
                  style={{ height: `${Math.max(m.cents ? 4 : 1, (m.cents / max) * 100)}%` }}
                  title={`${m.label}: ${formatPrice(m.cents)} (${m.count} ${m.count === 1 ? "venda" : "vendas"})`}
                />
                <span className={`text-xs capitalize ${m.current ? "font-semibold text-paper" : "text-fog"}`}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-paper">Estoque</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <StockCard title="Bikes novas" data={stock.nova} href="/admin/bicicletas" />
          <StockCard title="Seminovas" data={stock.seminova} href="/admin/bicicletas" />
        </div>
        {(stock.withoutPhoto > 0 || stock.withoutPrice > 0) && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {stock.withoutPhoto > 0 && (
              <Link
                href="/admin/bicicletas"
                className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-amber-200 transition hover:bg-amber-400/20"
              >
                <strong>{stock.withoutPhoto}</strong> {stock.withoutPhoto === 1 ? "bike no site sem foto" : "bikes no site sem foto"}
              </Link>
            )}
            {stock.withoutPrice > 0 && (
              <Link
                href="/admin/bicicletas"
                className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-amber-200 transition hover:bg-amber-400/20"
              >
                <strong>{stock.withoutPrice}</strong> {stock.withoutPrice === 1 ? "bike no site sem preço" : "bikes no site sem preço"}
              </Link>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-paper">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-mist transition hover:text-paper">
            Ver todos →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className={`${card} mt-4 text-center text-sm text-mist`}>Nenhum pedido ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-ink-soft">
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 transition hover:bg-paper/5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">
                    <span className="font-semibold text-paper">{orderCode(o)}</span>{" "}
                    <span className="text-mist">· {o.customer.name} · {o.bikeName}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-paper">{formatPrice(o.amountCents)}</span>
                    <OrderStatusBadge status={o.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
