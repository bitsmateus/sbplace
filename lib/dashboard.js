import { readStore } from "./db";
import { linkEffectiveStatus } from "./link-status";

// Números da tela inicial do painel. Tudo calculado na hora a partir do
// arquivo de dados (são poucos registros, não compensa guardar agregados).

const PAID = ["pago", "enviado", "entregue"];
const TZ = "America/Sao_Paulo";

// "2026-10" no fuso de Brasília
function monthKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" })
    .formatToParts(new Date(date));
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get("year")}-${get("month")}`;
}

function shiftMonth(key, delta) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("pt-BR", {
    month: "short",
    timeZone: "UTC",
  }).replace(".", "");
}

// Data em que o pagamento foi aprovado (pelo histórico do pedido).
export function paidAt(order) {
  return order.history?.find((h) => h.status === "pago")?.at || order.updatedAt || order.createdAt;
}

function stockOf(bikes, condition) {
  const list = bikes.filter((b) => (b.condition || "nova") === condition);
  const available = list.filter((b) => b.status === "disponivel");
  return {
    total: list.length,
    available: available.length,
    availableValueCents: available.reduce((sum, b) => sum + (b.priceCents || 0), 0),
    reserved: list.filter((b) => b.status === "reservada").length,
    sold: list.filter((b) => b.status === "vendida").length,
    hidden: list.filter((b) => b.status === "oculta").length,
  };
}

export function getDashboard() {
  const { bikes, orders, links } = readStore();
  const now = new Date();
  const thisMonth = monthKey(now);
  const lastMonth = shiftMonth(thisMonth, -1);

  const paid = orders.filter((o) => PAID.includes(o.status));
  const byMonth = new Map();
  for (const o of paid) {
    const key = monthKey(paidAt(o));
    const cur = byMonth.get(key) || { cents: 0, count: 0 };
    cur.cents += o.amountCents || 0;
    cur.count += 1;
    byMonth.set(key, cur);
  }

  const months = [];
  for (let i = 5; i >= 0; i -= 1) {
    const key = shiftMonth(thisMonth, -i);
    const v = byMonth.get(key) || { cents: 0, count: 0 };
    months.push({ key, label: monthLabel(key), ...v, current: key === thisMonth });
  }

  const cur = byMonth.get(thisMonth) || { cents: 0, count: 0 };
  const prev = byMonth.get(lastMonth) || { cents: 0, count: 0 };
  const totalCents = paid.reduce((s, o) => s + (o.amountCents || 0), 0);
  const fromLinksMonth = paid
    .filter((o) => o.source === "link" && monthKey(paidAt(o)) === thisMonth)
    .reduce((s, o) => s + o.amountCents, 0);

  const activeLinks = links.filter((l) => linkEffectiveStatus(l) === "ativo");
  const visibleBikes = bikes.filter((b) => b.status !== "oculta" && b.status !== "vendida");

  return {
    finance: {
      monthCents: cur.cents,
      monthCount: cur.count,
      lastMonthCents: prev.cents,
      changePct: prev.cents > 0 ? Math.round(((cur.cents - prev.cents) / prev.cents) * 100) : null,
      avgTicketCents: cur.count ? Math.round(cur.cents / cur.count) : 0,
      totalCents,
      totalCount: paid.length,
      monthFromSiteCents: cur.cents - fromLinksMonth,
      monthFromLinksCents: fromLinksMonth,
      months,
    },
    todo: {
      toShip: orders.filter((o) => o.status === "pago").length,
      toCheck: orders.filter((o) => o.status === "verificar_pagamento").length,
      inTransit: orders.filter((o) => o.status === "enviado").length,
      activeLinks: activeLinks.length,
      activeLinksCents: activeLinks.reduce((s, l) => s + l.amountCents, 0),
    },
    stock: {
      nova: stockOf(bikes, "nova"),
      seminova: stockOf(bikes, "seminova"),
      withoutPhoto: visibleBikes.filter((b) => !(b.images || []).length).length,
      withoutPrice: visibleBikes.filter((b) => !b.priceCents).length,
      featured: bikes.filter((b) => b.featured && b.status !== "oculta").length,
    },
    recentOrders: [...orders].sort((a, b) => b.id - a.id).slice(0, 6),
  };
}
