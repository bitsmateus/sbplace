"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, CONDITIONS, STATUS } from "@/lib/bike-constants";

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

export default function BikeForm({ bike }) {
  const router = useRouter();
  const isEditing = !!bike;

  const [name, setName] = useState(bike?.name || "");
  const [category, setCategory] = useState(bike?.category || CATEGORIES[0].value);
  const [condition, setCondition] = useState(bike?.condition || "nova");
  const [subtitle, setSubtitle] = useState(bike?.subtitle || "");
  const [price, setPrice] = useState(centsToInput(bike?.priceCents));
  const [cashPrice, setCashPrice] = useState(centsToInput(bike?.cashPriceCents));
  const [installments, setInstallments] = useState(
    bike?.installments ? String(bike.installments) : ""
  );
  const [installmentValue, setInstallmentValue] = useState(
    centsToInput(bike?.installmentValueCents)
  );
  const [description, setDescription] = useState(bike?.description || "");
  const [status, setStatus] = useState(bike?.status || "disponivel");
  const [featured, setFeatured] = useState(bike?.featured || false);
  const [images, setImages] = useState(bike?.images || []);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Falha ao enviar imagem.");
        }
        uploaded.push(data.filename);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(filename) {
    setImages((prev) => prev.filter((img) => img !== filename));
  }

  function moveImage(index, dir) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Dê um nome pra bicicleta.");
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      category,
      condition,
      subtitle: subtitle.trim(),
      priceCents: inputToCents(price),
      cashPriceCents: inputToCents(cashPrice),
      installments: Math.max(0, parseInt(installments, 10) || 0),
      installmentValueCents: inputToCents(installmentValue),
      description,
      status,
      featured,
      images,
    };

    try {
      const url = isEditing
        ? `/api/admin/bikes/${bike.id}`
        : "/api/admin/bikes";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível salvar.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div>
        <label className="block text-xs uppercase tracking-wide text-fog">
          Nome da bicicleta
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Turbo Levo G3 Comp Carbon"
          className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wide text-fog">
            Condição
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-fog">
            Seminovas aparecem na seção &quot;Seminovas de alto padrão&quot; do site.
          </p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-fog">
            Resumo (uma linha)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ex: Tamanho S5, kit Sram AXS"
            className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wide text-fog">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-fog">
            Preço (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0,00"
            className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
          />
        </div>
      </div>

      <div className="max-w-xs">
        <label className="block text-xs uppercase tracking-wide text-fog">
          Preço à vista (R$) — opcional
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={cashPrice}
          onChange={(e) => setCashPrice(e.target.value)}
          placeholder="0,00"
          className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
        />
        <p className="mt-2 text-xs text-fog">
          Se preencher, aparece &quot;ou R$ X à vista&quot; abaixo do parcelamento.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wide text-fog">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
          >
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end pb-3">
          <label className="flex items-center gap-3 text-sm text-mist">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-[#ff4d23]"
            />
            Mostrar em destaque na home
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-line p-5">
        <p className="text-xs uppercase tracking-wide text-fog">Parcelamento</p>
        <p className="mt-1 text-xs text-fog">
          Calculado automaticamente: {condition === "seminova" ? "21x" : "12x"}{" "}
          sem juros. Preencha só se quiser ajustar.
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-fog">Nº de parcelas</label>
            <input
              type="text"
              inputMode="numeric"
              value={installments}
              onChange={(e) => setInstallments(e.target.value.replace(/\D/g, ""))}
              placeholder={condition === "seminova" ? "21 (automático)" : "12 (automático)"}
              className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-fog">Valor da parcela (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              value={installmentValue}
              onChange={(e) => setInstallmentValue(e.target.value)}
              placeholder="automático"
              className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-fog">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Detalhes do modelo, tamanho do quadro, componentes, estado de conservação..."
          className="mt-2 w-full rounded-lg border border-line bg-ink-soft px-4 py-3 text-paper focus:border-mist focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wide text-fog">
          Fotos
        </label>

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div
                key={img}
                className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-ink-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/uploads/${img}`}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase text-ink">
                    Capa
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/80 py-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    className="px-1 text-xs text-mist hover:text-paper"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className="px-1 text-xs text-accent hover:text-accent-dark"
                  >
                    remover
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    className="px-1 text-xs text-mist hover:text-paper"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-line py-6 text-sm text-mist hover:border-mist/60 hover:text-paper">
          {uploading ? "Enviando..." : "+ Adicionar fotos"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="mt-2 text-xs text-fog">
          A primeira foto da lista aparece como capa no catálogo. JPG, PNG,
          WEBP ou AVIF, até 8MB cada.
        </p>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-accent px-7 py-3 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar bicicleta"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-mist hover:text-paper"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
