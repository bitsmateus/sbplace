"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Formulário rápido (nome + WhatsApp) para não perder quem chega pela
// campanha, olha o site e sai sem chamar no WhatsApp.
//
// Regras para não incomodar:
// - aparece só depois de 15 s na página OU quando a pessoa rola metade dela;
// - uma vez por visitante: fechou no X → só volta depois de 7 dias;
//   enviou o contato ou clicou em qualquer botão de WhatsApp → não volta mais;
// - não aparece no painel, no checkout, nos pedidos nem nos cartões da equipe;
// - X grande e sempre visível, fecha também com Esc ou tocando fora.
const CHAVE = "sbp_lead";
const CHAVE_ORIGEM = "sbp_origem";
const ESPERA_MS = 15_000;
const VOLTA_DEPOIS_MS = 7 * 24 * 60 * 60 * 1000;
const PAGINAS_FORA = ["/admin", "/comprar", "/pagar", "/pedido", "/equipe"];

function ler(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave));
  } catch {
    return null;
  }
}

function gravar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ s: estado, t: Date.now() }));
  } catch {}
}

function podeMostrar() {
  const salvo = ler(CHAVE);
  if (!salvo) return true;
  if (salvo.s === "fechado") return Date.now() - salvo.t > VOLTA_DEPOIS_MS;
  return false; // "enviado" ou "whatsapp"
}

// Mesma origem que vai no "(ref ...)" dos botões de WhatsApp.
function origemAtual() {
  const o = ler(CHAVE_ORIGEM);
  if (o && Date.now() - o.t < 30 * 24 * 60 * 60 * 1000) {
    if (o.c && o.a) return `${o.c} ${o.a}`;
    if (o.c) return o.c;
    if (o.meta) return "meta";
  }
  return "site";
}

function mascara(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function IconeX() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function LeadPopup() {
  const pathname = usePathname() || "/";
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const empresaRef = useRef(null);
  const nomeRef = useRef(null);

  const fora = PAGINAS_FORA.some((p) => pathname.startsWith(p));
  const naBike = pathname.startsWith("/bicicletas/");

  // Agenda a abertura (tempo ou rolagem) e para de vez se a pessoa já
  // chamou no WhatsApp.
  useEffect(() => {
    if (fora || !podeMostrar()) return;

    let disparado = false;
    function abrir() {
      if (disparado || !podeMostrar()) return;
      disparado = true;
      setAberto(true);
    }
    const timer = setTimeout(abrir, ESPERA_MS);
    function aoRolar() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total > 0.5) abrir();
    }
    function aoClicarWhats(e) {
      if (e.target.closest?.('a[href*="wa.me/"]')) {
        gravar("whatsapp");
        disparado = true;
        setAberto(false);
      }
    }
    window.addEventListener("scroll", aoRolar, { passive: true });
    document.addEventListener("click", aoClicarWhats, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", aoRolar);
      document.removeEventListener("click", aoClicarWhats, true);
    };
  }, [fora, pathname]);

  // Esc fecha; foca o nome no computador (no celular não, para o teclado
  // não subir sozinho e cobrir a tela).
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(e) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("keydown", aoTeclar);
    if (window.matchMedia("(min-width: 768px)").matches) nomeRef.current?.focus();
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]); // eslint-disable-line react-hooks/exhaustive-deps

  function fechar() {
    if (!enviado) gravar("fechado");
    setAberto(false);
  }

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    if (nome.trim().length < 2) return setErro("Digite seu nome.");
    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 10) return setErro("Digite seu WhatsApp com DDD.");

    setEnviando(true);
    try {
      const resp = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          phone: telefone,
          empresa: empresaRef.current?.value || "",
          page: window.location.pathname + window.location.search,
          pageTitle: document.title,
          origem: origemAtual(),
        }),
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json.error || "Não foi possível enviar.");
      gravar("enviado");
      setEnviado(true);
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead", {
          content_name: "Formulário do site",
          origem: origemAtual(),
          pagina: window.location.pathname,
        });
      }
      setTimeout(() => setAberto(false), 4500);
    } catch (err) {
      setErro(err.message || "Não foi possível enviar. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto || fora) return null;

  const primeiroNome = nome.trim().split(/\s+/)[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] md:items-center md:p-6"
      onClick={fechar}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-titulo"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-t-3xl bg-paper px-6 pb-7 pt-7 text-ink shadow-2xl shadow-black/40 md:rounded-3xl md:px-8 md:pb-8 md:pt-8"
        style={{ paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper transition hover:bg-accent hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <IconeX />
        </button>

        {enviado ? (
          <div className="pr-10 text-center md:pr-0">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/15 text-[#1a9e4b]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
            <h2 id="lead-titulo" className="display text-2xl">
              Obrigado{primeiroNome ? `, ${primeiroNome}` : ""}!
            </h2>
            <p className="mt-2 text-sm text-stone">
              Um consultor da SB Place vai chamar você no WhatsApp em breve.
            </p>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate>
            <p className="pr-12 text-xs font-semibold uppercase tracking-[0.14em] text-accent-dark">
              SB Place · Specialized
            </p>
            <h2 id="lead-titulo" className="display mt-2 pr-12 text-[1.6rem] md:text-3xl">
              {naBike ? "Gostou dessa bike?" : "Quer ajuda para escolher sua bike?"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {naBike
                ? "Deixe seu WhatsApp que um consultor manda fotos, condições e parcelamento."
                : "Deixe seu WhatsApp que um consultor chama você com as melhores opções."}
            </p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="sr-only">Seu nome</span>
                <input
                  ref={nomeRef}
                  type="text"
                  name="name"
                  autoComplete="given-name"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={80}
                  className="h-12 w-full rounded-xl border border-hairline bg-bone px-4 text-base outline-none transition placeholder:text-fog focus:border-ink focus:bg-paper"
                />
              </label>
              <label className="block">
                <span className="sr-only">WhatsApp com DDD</span>
                <input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="WhatsApp com DDD"
                  value={telefone}
                  onChange={(e) => setTelefone(mascara(e.target.value))}
                  className="h-12 w-full rounded-xl border border-hairline bg-bone px-4 text-base outline-none transition placeholder:text-fog focus:border-ink focus:bg-paper"
                />
              </label>
              {/* campo isca para robôs — pessoas não veem */}
              <input
                ref={empresaRef}
                type="text"
                name="empresa"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
            </div>

            {erro && (
              <p className="mt-3 text-sm font-medium text-accent-dark" role="alert">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-4 h-12 w-full rounded-full bg-ink text-base font-semibold text-paper transition hover:bg-accent hover:text-ink disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Quero ser chamado"}
            </button>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-fog">
              <span>Leva 5 segundos. Sem spam.</span>
              <button type="button" onClick={fechar} className="underline underline-offset-2 hover:text-ink">
                Agora não
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
