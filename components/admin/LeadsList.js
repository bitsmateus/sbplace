"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABEL = { novo: "Novo", chamado: "Já chamei", descartado: "Descartado" };
const STATUS_COR = {
  novo: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  chamado: "border-line bg-paper/5 text-mist",
  descartado: "border-line bg-transparent text-fog",
};

function formatDate(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function whatsLink(lead) {
  const nome = lead.name.split(/\s+/)[0];
  const texto = `Olá, ${nome}! Aqui é da SB Place Specialized. Vi que você deixou seu contato no nosso site. Posso te ajudar a escolher sua bike?`;
  return `https://wa.me/55${lead.phone}?text=${encodeURIComponent(texto)}`;
}

function paginaLegivel(lead) {
  const p = (lead.page || "/").split("?")[0];
  if (p === "/") return "Página inicial";
  if (p.startsWith("/bicicletas/")) {
    return (lead.pageTitle || "").split("|")[0].trim() || p.replace("/bicicletas/", "");
  }
  if (p === "/catalogo") return "Catálogo";
  return p;
}

export default function LeadsList({ leads }) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(null);

  async function mudar(id, status) {
    setOcupado(id);
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOcupado(null);
    router.refresh();
  }

  async function excluir(id) {
    if (!confirm("Excluir este contato?")) return;
    setOcupado(id);
    await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    setOcupado(null);
    router.refresh();
  }

  if (!leads.length) {
    return (
      <p className="mt-8 rounded-2xl border border-line p-6 text-sm text-mist">
        Nenhum contato por aqui ainda.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line">
      {leads.map((l) => (
        <li key={l.id} className={`flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between ${ocupado === l.id ? "opacity-50" : ""}`}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{l.name}</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_COR[l.status] || ""}`}>
                {STATUS_LABEL[l.status] || l.status}
              </span>
            </div>
            <div className="mt-1 text-sm text-mist">
              {l.phoneDisplay} · {formatDate(l.createdAt)}
            </div>
            <div className="mt-1 truncate text-xs text-fog">
              Página: {paginaLegivel(l)} · Origem: {l.origem}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a
              href={whatsLink(l)}
              data-sem-ref
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => l.status === "novo" && mudar(l.id, "chamado")}
              className="rounded-full bg-[#25D366] px-4 py-2 font-semibold text-ink transition hover:bg-[#1ebe5a]"
            >
              Chamar no WhatsApp
            </a>
            {l.status !== "chamado" && (
              <button onClick={() => mudar(l.id, "chamado")} className="rounded-full border border-line px-3 py-2 text-mist hover:text-paper">
                Já chamei
              </button>
            )}
            {l.status !== "novo" && (
              <button onClick={() => mudar(l.id, "novo")} className="rounded-full border border-line px-3 py-2 text-mist hover:text-paper">
                Voltar p/ novo
              </button>
            )}
            {l.status !== "descartado" && (
              <button onClick={() => mudar(l.id, "descartado")} className="rounded-full border border-line px-3 py-2 text-mist hover:text-paper">
                Descartar
              </button>
            )}
            <button onClick={() => excluir(l.id)} aria-label="Excluir" className="rounded-full px-3 py-2 text-fog hover:text-accent">
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
