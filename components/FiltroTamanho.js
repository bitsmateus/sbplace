"use client";

import { useRouter } from "next/navigation";

// Campo "Tamanho do quadro" do catálogo. Recebe os grupos de opções já montados
// no servidor e os outros filtros ativos, e navega para o catálogo filtrado.
export default function FiltroTamanho({ grupos, tamanho, filtros }) {
  const router = useRouter();

  function escolher(valor) {
    const qs = new URLSearchParams();
    if (filtros?.condicao) qs.set("condicao", filtros.condicao);
    if (filtros?.categoria) qs.set("categoria", filtros.categoria);
    if (valor) qs.set("tamanho", valor);
    if (filtros?.busca) qs.set("busca", filtros.busca);
    const str = qs.toString();
    router.push(str ? `/catalogo?${str}` : "/catalogo", { scroll: false });
  }

  return (
    <div className="relative w-full md:w-auto">
      <select
        value={tamanho || ""}
        onChange={(e) => escolher(e.target.value)}
        aria-label="Tamanho do quadro"
        className={`h-10 w-full cursor-pointer appearance-none rounded-full border pl-4 pr-10 text-sm font-semibold transition focus:outline-none md:w-auto ${
          tamanho
            ? "border-ink bg-ink text-paper"
            : "border-hairline bg-paper text-ink hover:border-ink focus:border-ink"
        }`}
      >
        <option value="">{tamanho ? "Todos os tamanhos" : "Tamanho do quadro"}</option>
        {grupos.map((grupo) => (
          <optgroup key={grupo.id} label={grupo.label}>
            {grupo.tamanhos.map((t) => (
              <option key={t} value={t}>
                {tamanho === t ? `Tamanho ${t}` : t}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
          tamanho ? "text-paper" : "text-stone"
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
