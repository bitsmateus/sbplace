"use client";

// Bolinhas de cor da bike nova, no mesmo espírito do site da Specialized:
// cada bolinha mostra as cores daquela pintura e, ao clicar, a galeria vai
// para a foto oficial da cor escolhida.
import { nomeDaCor } from "@/lib/cores-specialized";

export default function CoresDaBike({ cores, ativa, onEscolher }) {
  if (!cores || cores.length === 0) return null;

  const escolhida = cores[ativa] || cores[0];

  return (
    <div className="mt-4">
      <p className="text-[13px] text-stone">
        Cor:{" "}
        <span className="font-medium text-ink">{nomeDaCor(escolhida.nome)}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {cores.map((cor, i) => {
          const tons = cor.hex && cor.hex.length ? cor.hex : ["#D9D9D9"];
          const selecionada = i === ativa;
          return (
            <button
              key={cor.nome + i}
              type="button"
              onClick={() => onEscolher(i)}
              aria-label={nomeDaCor(cor.nome)}
              aria-pressed={selecionada}
              title={nomeDaCor(cor.nome)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                selecionada
                  ? "border-ink"
                  : "border-hairline hover:border-stone"
              }`}
            >
              <span className="flex h-6 w-6 overflow-hidden rounded-full ring-1 ring-ink/10">
                {tons.slice(0, 2).map((tom, t) => (
                  <span
                    key={tom + t}
                    className="h-full flex-1"
                    style={{ backgroundColor: tom }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
