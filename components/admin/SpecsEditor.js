"use client";

import { SPEC_SUGGESTIONS } from "@/lib/bike-constants";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-ink px-3 text-sm text-paper placeholder:text-fog focus:border-mist focus:outline-none";

// Itens típicos para começar rápido (o admin edita/remove/acrescenta à vontade).
const STARTERS = {
  nova: ["Tamanho do quadro", "Aro", "Material do quadro", "Grupo", "Suspensão", "Freios"],
  seminova: [
    "Tamanho do quadro",
    "Ano",
    "Grupo",
    "Suspensão",
    "Freios",
    "Km rodados",
    "Estado de conservação",
  ],
};

// Ficha técnica: lista editável de "item → valor" que aparece como tabela na
// página da bike.
export default function SpecsEditor({ specs, setSpecs, condition }) {
  const used = new Set(specs.map((s) => s.label.trim().toLowerCase()));
  const suggestions = SPEC_SUGGESTIONS.filter((s) => !used.has(s.toLowerCase()));

  const update = (i, field, value) =>
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const remove = (i) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i, dir) =>
    setSpecs((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const add = (label = "") => setSpecs((prev) => [...prev, { label, value: "" }]);

  return (
    <div>
      {specs.length === 0 && (
        <div className="rounded-xl border border-dashed border-line p-5 text-center">
          <p className="text-sm text-mist">
            Nenhum item ainda. A ficha técnica aparece como uma tabela na página
            da bike.
          </p>
          <button
            type="button"
            onClick={() =>
              setSpecs(STARTERS[condition === "seminova" ? "seminova" : "nova"].map((label) => ({ label, value: "" })))
            }
            className="mt-3 inline-flex h-10 items-center rounded-full border border-line px-5 text-sm text-paper transition hover:border-gold hover:text-gold"
          >
            Preencher com os itens mais comuns
          </button>
        </div>
      )}

      {specs.length > 0 && (
        <ul className="space-y-2">
          {specs.map((s, i) => (
            <li key={i} className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
              <input
                type="text"
                list="spec-labels"
                value={s.label}
                onChange={(e) => update(i, "label", e.target.value)}
                placeholder="Item (ex: Tamanho do quadro)"
                aria-label={`Item ${i + 1}`}
                className={inputClass}
              />
              <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                <input
                  type="text"
                  value={s.value}
                  onChange={(e) => update(i, "value", e.target.value)}
                  placeholder="Valor (ex: M / 54)"
                  aria-label={`Valor de ${s.label || `item ${i + 1}`}`}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Subir"
                  className="h-10 w-10 rounded-full text-mist transition hover:bg-paper/10 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === specs.length - 1}
                  aria-label="Descer"
                  className="h-10 w-10 rounded-full text-mist transition hover:bg-paper/10 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remover ${s.label || `item ${i + 1}`}`}
                  className="h-10 w-10 rounded-full text-fog transition hover:bg-accent/15 hover:text-accent"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <datalist id="spec-labels">
        {SPEC_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => add()}
          className="inline-flex h-10 items-center rounded-full bg-paper px-5 text-sm font-semibold text-ink transition hover:bg-gold"
        >
          + Adicionar item
        </button>
        {suggestions.slice(0, 8).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => add(s)}
            className="inline-flex h-10 items-center rounded-full border border-line px-4 text-xs text-mist transition hover:border-mist/60 hover:text-paper"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}
