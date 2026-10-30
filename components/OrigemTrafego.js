"use client";

import { useEffect } from "react";

// Rastreio de origem dos contatos que saem do site para o WhatsApp.
//
// Todo clique em botão de WhatsApp do site acrescenta uma linha no fim da
// mensagem, ex.: "(ref leads-site-whatsapp | bike-tarmac-sl7)".
// A primeira parte diz DE ONDE a pessoa veio e a segunda EM QUE PÁGINA (ou em
// que botão) ela clicou:
//
//   (ref leads-site-whatsapp ad01 | home)  -> veio de anúncio da Meta
//   (ref site | bikefit)                   -> veio direto/orgânico, botão do bike fit
//   (ref meta | catalogo-seminova)         -> veio do Meta sem utm_campaign
//
// Quando a pessoa chega por um anúncio (link com utm_campaign ou fbclid), essa
// origem fica guardada por 30 dias, então ela vale mesmo que o contato aconteça
// alguns dias depois. Sem anúncio nenhum, a origem é "site" — assim nenhum
// contato chega sem identificação. O NX lê esse texto e aplica a etiqueta no
// contato automaticamente.
//
// Todo clique num botão de WhatsApp também dispara o evento "Lead" do Meta
// Pixel. É esse evento que a campanha "LEADS SITE" usa para medir e otimizar,
// e é ele que aparece na coluna de leads do Gerenciador, separado por anúncio.
const CHAVE = "sbp_origem";
const VALIDADE_MS = 30 * 24 * 60 * 60 * 1000;
const ORIGEM_PADRAO = "site";

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
  const anuncio = params.get("utm_content") || "";
  const fonte = params.get("utm_source") || "";
  const veioDoMeta =
    params.has("fbclid") || /facebook|instagram|meta|^fb|^ig/i.test(fonte);
  if (!campanha && !veioDoMeta) return;
  // Vale o último anúncio clicado: é ele que trouxe a pessoa desta vez.
  const origem = {
    c: campanha ? slug(campanha) : "",
    a: anuncio ? slug(anuncio) : "",
    meta: veioDoMeta,
    t: Date.now(),
  };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(origem));
  } catch {}
}

// De onde a pessoa veio. Sem anúncio guardado, o contato é do próprio site.
function deOndeVeio(origem) {
  if (origem) {
    if (origem.c && origem.a) return `${origem.c} ${origem.a}`;
    if (origem.c) return origem.c;
    if (origem.meta) return "meta";
  }
  return ORIGEM_PADRAO;
}

// Onde ela clicou: a página mais, quando o botão diz quem é com data-ref
// (ex.: data-ref="bikefit"), o nome do botão — "home-bikefit",
// "bike-turbo-levo-4-comprar", "catalogo-seminova-flutuante".
function paginaAtual() {
  const caminho = window.location.pathname.replace(/\/+$/, "");
  if (!caminho) return "home";
  if (caminho.startsWith("/bicicletas/")) {
    return `bike-${slug(caminho.slice("/bicicletas/".length))}`;
  }
  if (caminho === "/catalogo") {
    const condicao = new URLSearchParams(window.location.search).get("condicao");
    return condicao ? `catalogo-${slug(condicao)}` : "catalogo";
  }
  return slug(caminho) || "home";
}

function ondeClicou(link) {
  const pagina = paginaAtual();
  const botao = link?.dataset?.ref ? slug(link.dataset.ref) : "";
  return botao ? `${pagina}-${botao}` : pagina;
}

// Conta o clique no WhatsApp como Lead no Meta Pixel. O Meta liga o evento
// ao anúncio que trouxe a pessoa, então o número sai por anúncio sem
// precisar perguntar para a equipe.
function registrarLead(de, onde) {
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "Lead", {
    content_name: "Clique no WhatsApp",
    origem: de,
    botao: onde,
    pagina: window.location.pathname,
  });
}

export default function OrigemTrafego() {
  useEffect(() => {
    salvarOrigemDaUrl();

    // Captura o clique antes de o navegador seguir o link e acrescenta a
    // origem no texto do wa.me. Assim vale para todos os botões do site sem
    // mexer em cada um deles.
    function aoClicar(evento) {
      const link = evento.target.closest?.('a[href*="wa.me/"]');
      // data-sem-ref: link do painel para a loja chamar o cliente — não é
      // lead e não pode levar a marca de origem na mensagem.
      if (!link || link.hasAttribute("data-sem-ref")) return;

      const de = deOndeVeio(lerOrigem());
      const onde = ondeClicou(link);
      registrarLead(de, onde);

      const url = new URL(link.href);
      const texto = url.searchParams.get("text") || "";
      // Tira uma referência de um clique anterior (o botão flutuante e o do
      // topo ficam na tela em todas as páginas) antes de escrever a atual.
      const limpo = texto.replace(/\s*\(ref [^)]*\)\s*$/, "");
      url.searchParams.set("text", `${limpo}\n\n(ref ${de} | ${onde})`);
      link.href = url.toString();
    }

    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);

  return null;
}
