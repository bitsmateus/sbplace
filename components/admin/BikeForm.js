"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  CONDITIONS,
  STATUS,
  formatPrice,
  installmentInfo,
  MAX_INSTALLMENTS,
} from "@/lib/bike-constants";
import BikeCard from "@/components/BikeCard";
import PhotoManager from "./PhotoManager";
import SpecsEditor from "./SpecsEditor";

function centsToInput(cents) {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

function inputToCents(value) {
  const normalized = String(value || "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");
  const num = parseFloat(normalized);
  if (Number.isNaN(num)) return 0;
  return Math.round(num * 100);
}

const inputClass =
  "mt-2 w-full rounded-lg border border-line bg-ink px-4 py-3 text-paper placeholder:text-fog focus:border-mist focus:outline-none";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-fog";
const hintClass = "mt-2 text-xs text-fog";

function Section({ number, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-line bg-ink-soft p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper text-xs font-bold text-ink">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-mist">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Segmented({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-2 flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`h-11 rounded-full px-5 text-sm font-semibold transition ${
              active
                ? o.gold
                  ? "bg-gold text-ink"
                  : "bg-paper text-ink"
                : "border border-line text-mist hover:border-mist/60 hover:text-paper"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function BikeForm({ bike, initialFlash = "" }) {
  const router = useRouter();
  const isEditing = !!bike;

  const [name, setName] = useState(bike?.name || "");
  const [condition, setCondition] = useState(bike?.condition || "nova");
  const [category, setCategory] = useState(bike?.category || CATEGORIES[0].value);
  const [status, setStatus] = useState(bike?.status || (isEditing ? "disponivel" : "oculta"));
  const [featured, setFeatured] = useState(bike?.featured || false);
  const [subtitle, setSubtitle] = useState(bike?.subtitle || "");
  const [description, setDescription] = useState(bike?.description || "");
  const [price, setPrice] = useState(centsToInput(bike?.priceCents));
  const [cashPrice, setCashPrice] = useState(centsToInput(bike?.cashPriceCents));
  const [installments, setInstallments] = useState(
    bike?.installments ? String(bike.installments) : ""
  );
  const [installmentValue, setInstallmentValue] = useState(
    centsToInput(bike?.installmentValueCents)
  );
  const [specs, setSpecs] = useState(bike?.specs || []);
  const [images, setImages] = useState(bike?.images || []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState(initialFlash);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const payload = useMemo(
    () => ({
      name: name.trim(),
      category,
      condition,
      subtitle: subtitle.trim(),
      priceCents: inputToCents(price),
      cashPriceCents: inputToCents(cashPrice),
      installments: Math.max(0, parseInt(installments, 10) || 0),
      installmentValueCents: inputToCents(installmentValue),
      description,
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      status,
      featured,
      images,
    }),
    [name, category, condition, subtitle, price, cashPrice, installments, installmentValue, description, specs, status, featured, images]
  );

  // "sujo" = há alterações não salvas
  const [baseline, setBaseline] = useState(() => JSON.stringify(payload));
  const dirty = JSON.stringify(payload) !== baseline;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // tira ?criada / ?duplicada da barra de endereço (o aviso já foi lido)
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  const previewBike = {
    id: 0,
    slug: "preview",
    ...payload,
    name: payload.name || "Nome da bicicleta",
  };
  const parcel = installmentInfo(payload);

  const checklist = [
    ["Nome", !!payload.name],
    ["Preço", payload.priceCents > 0],
    ["Fotos", images.length > 0],
    ["Descrição", description.trim().length > 0],
    ["Ficha técnica", payload.specs.length > 0],
  ];

  async function save({ goBack = false } = {}) {
    setError("");
    if (!payload.name) {
      setError("Dê um nome para a bicicleta.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (status !== "oculta" && payload.priceCents <= 0) {
      setError(
        "Informe o preço. Se ainda não está pronta para o site, deixe o status como Oculta."
      );
      return;
    }

    setSaving(true);
    try {
      const url = isEditing ? `/api/admin/bikes/${bike.id}` : "/api/admin/bikes";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");

      setBaseline(JSON.stringify(payload));

      if (!isEditing) {
        router.replace(`/admin/bicicletas/${data.bike.id}?criada=1`);
        return;
      }
      if (goBack) {
        router.push("/admin");
      } else {
        setFlash("Alterações salvas.");
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bikes/${bike.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setBaseline(JSON.stringify(payload)); // não avisar de alterações ao sair
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Não foi possível excluir.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="pb-28"
    >
      {flash && (
        <div role="status" className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-200">
          {flash}
        </div>
      )}
      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-accent/50 bg-accent/10 px-5 py-3 text-sm text-accent">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="space-y-6">
          <Section number="1" title="Tipo e situação" subtitle="Define em qual parte do site a bike aparece.">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <span className={labelClass}>Condição</span>
                <Segmented
                  label="Condição"
                  value={condition}
                  onChange={setCondition}
                  options={CONDITIONS.map((c) => ({ ...c, gold: c.value === "seminova" }))}
                />
                <p className={hintClass}>
                  {condition === "seminova"
                    ? "Seminova: enviada para todo o Brasil, até 21x sem juros."
                    : "Nova: venda e retirada somente na loja, até 12x sem juros."}
                </p>
              </div>
              <div>
                <label htmlFor="status" className={labelClass}>
                  Situação
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass}
                >
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <p className={hintClass}>
                  Use <strong className="text-mist">Oculta</strong> enquanto estiver
                  cadastrando. Vendida continua aparecendo, sem o botão de compra.
                </p>
              </div>
            </div>
          </Section>

          <Section number="2" title="Informações da bike">
            <div>
              <label htmlFor="name" className={labelClass}>
                Nome da bicicleta
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Turbo Levo G3 Comp Carbon"
                className={inputClass}
              />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="category" className={labelClass}>
                  Tipo
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subtitle" className={labelClass}>
                  Resumo (uma linha)
                </label>
                <input
                  id="subtitle"
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Tamanho S5, kit Sram AXS"
                  className={inputClass}
                />
                <p className={hintClass}>Aparece abaixo do nome no card.</p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className={labelClass}>
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                placeholder="Conte a história desta bike: estado, diferenciais, upgrades, para quem ela é indicada…"
                className={inputClass}
              />
              <p className={hintClass}>
                {description.length} caracteres. Quebras de linha são mantidas na
                página.
              </p>
            </div>

            <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-mist">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-5 w-5 shrink-0 rounded border-line accent-[#CDAA5E]"
              />
              Mostrar em destaque (aparece primeiro na lista)
            </label>
          </Section>

          <Section number="3" title="Preço e pagamento" subtitle="O parcelamento é calculado sozinho; ajuste só se precisar.">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className={labelClass}>
                  Preço (R$)
                </label>
                <input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="cash" className={labelClass}>
                  Preço à vista (R$) — opcional
                </label>
                <input
                  id="cash"
                  type="text"
                  inputMode="decimal"
                  value={cashPrice}
                  onChange={(e) => setCashPrice(e.target.value)}
                  placeholder="0,00"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-line p-4">
              <p className={labelClass}>Parcelamento</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="inst" className="block text-xs text-fog">
                    Nº de parcelas
                  </label>
                  <input
                    id="inst"
                    type="text"
                    inputMode="numeric"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value.replace(/\D/g, ""))}
                    placeholder={`${MAX_INSTALLMENTS[condition]} (automático)`}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="instv" className="block text-xs text-fog">
                    Valor da parcela (R$)
                  </label>
                  <input
                    id="instv"
                    type="text"
                    inputMode="decimal"
                    value={installmentValue}
                    onChange={(e) => setInstallmentValue(e.target.value)}
                    placeholder="automático"
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-mist">
                No site:{" "}
                <strong className="text-paper">
                  {payload.priceCents > 0
                    ? `${parcel.count}x de ${formatPrice(parcel.valueCents)} sem juros`
                    : "informe o preço para ver"}
                </strong>
                {payload.cashPriceCents > 0 && ` · ou ${formatPrice(payload.cashPriceCents)} à vista`}
              </p>
            </div>
          </Section>

          <Section number="4" title="Fotos" subtitle="Quanto mais fotos, mais confiança. A primeira é a capa.">
            <PhotoManager images={images} setImages={setImages} onError={setError} />
          </Section>

          <Section number="5" title="Ficha técnica" subtitle="Informações objetivas, mostradas em tabela na página da bike.">
            <SpecsEditor specs={specs} setSpecs={setSpecs} condition={condition} />
          </Section>
        </div>

        {/* Coluna lateral: pré-visualização e checklist */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-ink-soft p-5">
            <p className={labelClass}>Como aparece no site</p>
            <div className="pointer-events-none mt-4 rounded-2xl bg-paper p-3 text-ink" aria-hidden>
              <BikeCard bike={previewBike} variant="light" />
            </div>
            {status === "oculta" && (
              <p className="mt-3 text-xs text-amber-300">
                Situação &ldquo;Oculta&rdquo;: esta bike não aparece no site.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-ink-soft p-5">
            <p className={labelClass}>Checklist</p>
            <ul className="mt-3 space-y-2 text-sm">
              {checklist.map(([label, ok]) => (
                <li key={label} className={`flex items-center gap-2 ${ok ? "text-paper" : "text-fog"}`}>
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                      ok ? "bg-emerald-500/20 text-emerald-300" : "border border-line"
                    }`}
                  >
                    {ok ? "✓" : ""}
                  </span>
                  {label}
                  <span className="sr-only">{ok ? "preenchido" : "faltando"}</span>
                </li>
              ))}
            </ul>
          </div>

          {isEditing && (
            <div className="space-y-2 text-sm">
              {status !== "oculta" && (
                <Link
                  href={`/bicicletas/${bike.slug}`}
                  target="_blank"
                  className="flex h-11 items-center justify-center rounded-full border border-line text-mist transition hover:text-paper"
                >
                  Ver página no site ↗
                </Link>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex h-11 w-full items-center justify-center rounded-full text-fog transition hover:text-accent"
              >
                Excluir bicicleta
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Barra de salvar fixa */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-sm text-fog" aria-live="polite">
            {dirty ? (
              <span className="text-amber-300">● Alterações não salvas</span>
            ) : isEditing ? (
              "Tudo salvo"
            ) : (
              "Nova bicicleta"
            )}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex h-11 items-center rounded-full px-5 text-sm text-mist transition hover:text-paper"
            >
              {dirty ? "Descartar" : "Voltar"}
            </Link>
            {isEditing && (
              <button
                type="button"
                disabled={saving}
                onClick={() => save({ goBack: true })}
                className="hidden h-11 items-center rounded-full border border-line px-5 text-sm text-paper transition hover:border-mist/60 sm:inline-flex"
              >
                Salvar e voltar
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center rounded-full bg-paper px-7 text-sm font-semibold text-ink transition hover:bg-gold disabled:opacity-60"
            >
              {saving ? "Salvando…" : isEditing ? "Salvar" : "Cadastrar bicicleta"}
            </button>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="del-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-ink p-6" onClick={(e) => e.stopPropagation()}>
            <h2 id="del-title" className="text-lg font-semibold">
              Excluir esta bicicleta?
            </h2>
            <p className="mt-2 text-sm text-mist">
              <strong className="text-paper">{bike?.name}</strong> e todas as fotos dela
              serão apagadas de vez. Para só tirar do site, mude a situação para
              Oculta.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-11 rounded-full border border-line px-5 text-sm text-mist hover:text-paper">
                Cancelar
              </button>
              <button type="button" onClick={remove} disabled={deleting} className="h-11 rounded-full bg-accent px-5 text-sm font-semibold text-ink hover:bg-accent-dark disabled:opacity-60">
                {deleting ? "Excluindo…" : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
