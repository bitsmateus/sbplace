"use client";

import { useEffect } from "react";

// Rastreio de origem do tráfego pago. Quando a pessoa chega no site por um
// anúncio (link com utm_campaign ou fbclid), guardamos de onde ela veio por
// 30 dias. Ao clicar em qualquer botão de WhatsApp do site, essa origem vai
// no fim da mensagem, ex.: "(ref leads-site-whatsapp)". O NX lê esse texto
// e aplica a etiqueta da campanha no contato automaticamente.
const CHAVE = "sbp_origem";
const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000;

function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function lerOrigem() {
  try {
    const origem = JSON.parse(localStorage.getItem(CHAVE));
    if (origem && Date.now() - origem.t < VALIDADE_MS) return origem;
  } catch {}
  return null;
}

function salvarOrigemDaUrl() {
  const params = new URLSearchParams(window.location.search);
  const campanha = params.get("utm_campaign");
  const fonte = params.get("utm_source") || "";
  const veioDoMeta =
    params.has("fbclid") || /facebook|instagram|meta|^fb|^ig/i.test(fonte);
  if (!campanha && !veioDoMeta) return;
  // Vale o último anúncio clicado: é ele que trouxe a pessoa desta vez.
  const origem = { c: campanha ? slug(campanha) : "", meta: veioDoMeta, t: Date.now() };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(origem));
  } catch {}
}

function referencia(origem) {
  if (!origem) return null;
  if (origem.c) return `ref ${origem.c}`;
  if (origem.meta) return "ref meta";
  return null;
}

export default function OrigemTrafego() {
  useEffect(() => {
    salvarOrigemDaUrl();

    // Captura o clique antes de o navegador seguir o link e acrescenta a
    // origem no texto do wa.me. Assim vale para todos os botões do site sem
    // mexer em cada um deles.
    function aoClicar(evento) {
      const link = evento.target.closest?.('a[href*="wa.me/"]');
      if (!link) return;
      const ref = referencia(lerOrigem());
      if (!ref) return;
      const url = new URL(link.href);
      const texto = url.searchParams.get("text") || "";
      if (texto.includes(ref)) return;
      url.searchParams.set("text", `${texto}\n\n(${ref})`);
      link.href = url.toString();
    }

    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);

  return null;
}
