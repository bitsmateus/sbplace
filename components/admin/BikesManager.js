"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, CATEGORIES, STATUS } from "@/lib/bike-constants";
import { uploadUrl } from "@/lib/uploads";

const TABS = [
  { value: "todas", label: "Todas" },
  { value: "nova", label: "Novas" },
  { value: "seminova", label: "Seminovas" },
];

const SORTS = [
  { value: "padrao", label: "Ordem do site" },
  { value: "recentes", label: "Mais recentes" },
  { value: "nome", label: "Nome (A–Z)" },
  { value: "menor", label: "Menor preço" },
  { value: "maior", label: "Maior preço" },
];

const STATUS_STYLE = {
  disponivel: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  reservada: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  vendida: "border-line bg-ink-soft text-fog",
  oculta: "border-dashed border-line bg-transparent text-fog",
};

const fieldClass =
  "h-11 rounded-lg border border-line bg-ink-soft px-3 text-sm text-paper focus:border-mist focus:outline-none";

export default function BikesManager({ bikes }) {
  const router = useRouter();
  const [items, setItems] = useState(bikes);
  const [tab, setTab] = useState("todas");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("padrao");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");

  // quando o servidor manda uma lista nova (router.refresh), atualiza a tela
  const [prevBikes, setPrevBikes] = useState(bikes);
  if (bikes !== prevBikes) {
    setPrevBikes(bikes);
    setItems(bikes);
  }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const cond = (b) => b.condition || "nova";
  const counts = useMemo(
    () => ({
      todas: items.length,
      nova: items.filter((b) => cond(b) === "nova").length,
      seminova: items.filter((b) => cond(b) === "seminova").length,
    }),
    [items]
  );
  const stats = useMemo(
    () => ({
      disponivel: items.filter((b) => b.status === "disponivel").length,
      reservada: items.filter((b) => b.status === "reservada").length,
      vendida: items.filter((b) => b.status === "vendida").length,
      oculta: items.filter((b) => b.status === "oculta").length,
    }),
    [items]
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter((b) => {
      if (tab !== "todas" && cond(b) !== tab) return false;
      if (status && b.status !== status) return false;
      if (category && b.category !== category) return false;
      if (
        needle &&
        !`${b.name} ${b.subtitle || ""} ${b.slug}`.toLowerCase().includes(needle)
      )
        return false;
      return true;
    });
    if (sort === "recentes") list = [...list].sort((a, b) => b.id - a.id);
    if (sort === "nome")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sort === "menor") list = [...list].sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "maior") list = [...list].sort((a, b) => b.priceCents - a.priceCents);
    return list;
  }, [items, tab, status, category, q, sort]);

  async function patch(bike, changes, okMessage) {
    setBusyId(bike.id);
    const previous = items;
    setItems((list) => list.map((b) => (b.id === bike.id ? { ...b, ...changes } : b)));
    try {
      const res = await fetch(`/api/admin/bikes/${bike.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error();
      setToast(okMessage);
      router.refresh();
    } catch {
      setItems(previous);
      setToast("Não foi possível salvar. Tente de novo.");
    } finally {
      setBusyId(null);
    }
  }

  async function duplicate(bike) {
    setBusyId(bike.id);
    try {
      const res = await fetch(`/api/admin/bikes/${bike.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      router.push(`/admin/bicicletas/${data.bike.id}?duplicada=1`);
    } catch {
      setToast("Não foi possível duplicar.");
      setBusyId(null);
    }
  }

  async function remove(bike) {
    setBusyId(bike.id);
    try {
      const res = await fetch(`/api/admin/bikes/${bike.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((list) => list.filter((b) => b.id !== bike.id));
      setToast(`"${bike.name}" excluída.`);
      router.refresh();
    } catch {
      setToast("Não foi possível excluir.");
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-12 text-center">
        <p className="text-lg font-semibold">Nenhuma bicicleta cadastrada ainda</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-mist">
          Clique em &ldquo;Nova bicicleta&rdquo; para cadastrar a primeira. Você
          escolhe se é nova ou seminova, sobe as fotos e preenche a ficha
          técnica.
        </p>
        <Link
          href="/admin/bicicletas/nova"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-paper px-7 text-sm font-semibold text-ink transition hover:bg-gold"
        >
          + Cadastrar primeira bike
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Disponíveis", stats.disponivel, "text-emerald-300"],
          ["Reservadas", stats.reservada, "text-amber-300"],
          ["Vendidas", stats.vendida, "text-mist"],
          ["Ocultas", stats.oculta, "text-fog"],
        ].map(([label, n, color]) => (
          <div key={label} className="rounded-xl border border-line bg-ink-soft p-4">
            <p className={`text-2xl font-semibold ${color}`}>{n}</p>
            <p className="text-xs text-fog">{label}</p>
          </div>
        ))}
      </div>

      {/* Abas */}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por condição">
        {TABS.map((t) => {
          const active = tab === t.value;
          const gold = t.value === "seminova";
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.value)}
              className={`inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition ${
                active
                  ? gold
                    ? "bg-gold text-ink"
                    : "bg-paper text-ink"
                  : "border border-line text-mist hover:border-mist/60 hover:text-paper"
              }`}
            >
              {t.label}
              <span className={`text-xs ${active ? "opacity-70" : "text-fog"}`}>
                {counts[t.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome…"
          aria-label="Buscar bicicleta"
          className={`${fieldClass} w-full`}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status" className={fieldClass}>
          <option value="">Todos os status</option>
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label.replace(" (não aparece no site)", "")}
            </option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrar por tipo" className={fieldClass}>
          <option value="">Todos os tipos</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar" className={fieldClass}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Lista */}
      <p className="mt-6 text-sm text-fog" aria-live="polite">
        {visible.length} {visible.length === 1 ? "bicicleta" : "bicicletas"}
      </p>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-sm text-mist">
          Nenhuma bicicleta com esses filtros.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {visible.map((bike) => {
            const isUsed = cond(bike) === "seminova";
            const catLabel = CATEGORIES.find((c) => c.value === bike.category)?.label || bike.category;
            const busy = busyId === bike.id;
            return (
              <li
                key={bike.id}
                className={`grid gap-4 rounded-2xl border border-line bg-ink-soft p-4 transition lg:grid-cols-[minmax(0,2.6fr)_1fr_1.1fr_auto] lg:items-center ${
                  busy ? "opacity-60" : ""
                }`}
              >
                <Link
                  href={`/admin/bicicletas/${bike.id}`}
                  className="group flex min-w-0 items-center gap-4"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink">
                    {bike.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={uploadUrl(bike.images[0], 160)}
                        srcSet={`${uploadUrl(bike.images[0], 160)} 1x, ${uploadUrl(bike.images[0], 320)} 2x`}
                        width={80}
                        height={80}
                        loading="lazy"
                        decoding="async"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-fog">
                        sem foto
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-paper group-hover:underline">{bike.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fog">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          isUsed ? "bg-gold text-ink" : "bg-paper text-ink"
                        }`}
                      >
                        {isUsed ? "Seminova" : "Nova"}
                      </span>
                      <span>{catLabel}</span>
                      <span>· {bike.images?.length || 0} {bike.images?.length === 1 ? "foto" : "fotos"}</span>
                    </div>
                  </div>
                </Link>

                <div>
                  <p className="text-lg font-semibold">{formatPrice(bike.priceCents)}</p>
                  {bike.cashPriceCents > 0 && (
                    <p className="text-xs text-fog">à vista {formatPrice(bike.cashPriceCents)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={bike.status}
                    disabled={busy}
                    onChange={(e) => patch(bike, { status: e.target.value }, "Status atualizado.")}
                    aria-label={`Status de ${bike.name}`}
                    className={`h-10 rounded-full border px-3 text-xs font-semibold focus:outline-none ${STATUS_STYLE[bike.status] || ""}`}
                  >
                    {STATUS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-ink text-paper">
                        {s.label.replace(" (não aparece no site)", "")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      patch(
                        bike,
                        { featured: !bike.featured },
                        bike.featured ? "Removida dos destaques." : "Marcada como destaque."
                      )
                    }
                    aria-pressed={!!bike.featured}
                    aria-label={bike.featured ? "Remover dos destaques" : "Marcar como destaque"}
                    title={bike.featured ? "Em destaque" : "Marcar como destaque"}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${
                      bike.featured
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-line text-fog hover:text-paper"
                    }`}
                  >
                    ★
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Link
                    href={`/admin/bicicletas/${bike.id}`}
                    className="inline-flex h-10 items-center rounded-full bg-paper px-5 font-semibold text-ink transition hover:bg-gold"
                  >
                    Editar
                  </Link>
                  {bike.status !== "oculta" && (
                    <Link
                      href={`/bicicletas/${bike.slug}`}
                      target="_blank"
                      className="inline-flex h-10 items-center rounded-full border border-line px-4 text-mist transition hover:text-paper"
                    >
                      Ver ↗
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => duplicate(bike)}
                    className="inline-flex h-10 items-center rounded-full border border-line px-4 text-mist transition hover:text-paper"
                  >
                    Duplicar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmDelete(bike)}
                    className="inline-flex h-10 items-center rounded-full px-3 text-fog transition hover:text-accent"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-ink p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="del-title" className="text-lg font-semibold">
              Excluir esta bicicleta?
            </h2>
            <p className="mt-2 text-sm text-mist">
              <strong className="text-paper">{confirmDelete.name}</strong> e todas as
              fotos dela serão apagadas de vez. Se você só quer tirar do site,
              use o status <strong className="text-paper">Oculta</strong>.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="h-11 rounded-full border border-line px-5 text-sm text-mist hover:text-paper"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => remove(confirmDelete)}
                disabled={busyId === confirmDelete.id}
                className="h-11 rounded-full bg-accent px-5 text-sm font-semibold text-ink hover:bg-accent-dark disabled:opacity-60"
              >
                {busyId === confirmDelete.id ? "Excluindo…" : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aviso rápido */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink shadow-xl"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
