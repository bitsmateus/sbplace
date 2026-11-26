"use client";

import { useRouter } from "next/navigation";

// Opções do campo "Ordenar por" do catálogo. O valor vazio é a ordem padrão
// (destaques primeiro, depois a posição definida no admin).
const ORDENS = [
  { value: "", label: "Destaques" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
];

// Campo "Ordenar por" do catálogo. Mantém os outros filtros ativos e navega
// para o catálogo com a nova ordem.
export default function FiltroOrdem({ ordem, filtros }) {
  const router = useRouter();

  function escolher(valor) {
    const qs = new URLSearchParams();
    if (filtros?.condicao) qs.set("condicao", filtros.condicao);
    if (filtros?.categoria) qs.set("categoria", filtros.categoria);
    if (filtros?.tamanho) qs.set("tamanho", filtros.tamanho);
    if (filtros?.busca) qs.set("busca", filtros.busca);
    if (valor) qs.set("ordem", valor);
    const str = qs.toString();
    router.push(str ? `/catalogo?${str}` : "/catalogo", { scroll: false });
  }

  return (
    <div className="relative w-full md:w-auto">
      <select
        value={ordem || ""}
        onChange={(e) => escolher(e.target.value)}
        aria-label="Ordenar por"
        className={`h-10 w-full cursor-pointer appearance-none rounded-full border pl-4 pr-10 text-sm font-semibold transition focus:outline-none md:w-auto ${
          ordem
            ? "border-ink bg-ink text-paper"
            : "border-hairline bg-paper text-ink hover:border-ink focus:border-ink"
        }`}
      >
        {ORDENS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value ? o.label : ordem ? "Destaques" : "Ordenar por"}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
          ordem ? "text-paper" : "text-stone"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 7.5l5 5 5-5" />
      </svg>
    </div>
  );
}
