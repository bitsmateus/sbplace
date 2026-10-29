import { NextResponse } from "next/server";
import { listBikes } from "@/lib/bikes";
import { formatPrice, installmentInfo, CATEGORIES, isInReview } from "@/lib/bike-constants";

// Consulta de estoque usada pela Lia, o agente de IA do WhatsApp (nxSystems).
//
// A Lia chama este endereço quando o cliente quer ver seminovas, pergunta por
// um modelo ou diz quanto quer investir. A resposta traz só as seminovas que
// estão à venda agora (bike vendida, reservada ou oculta não aparece), com
// nome, tamanho, preço à vista, parcelado e o link da página — o que o
// consultor mandaria à mão. Seminova com o selo "Em revisão" aparece com o
// aviso de que está em revisão na oficina e logo fica liberada.
//
// Somente leitura: os dados são os mesmos que já aparecem no catálogo público.
// Aceita GET (?tipo=mtb&valor_maximo=20000&altura=175&modelo=razzo) e POST com
// JSON em qualquer formato — as informações são procuradas pelo nome do campo
// em qualquer nível do corpo, porque cada plataforma manda num formato.
//
// Opcional: defina LIA_TOKEN no ambiente para exigir uma senha (a "Senha de
// acesso" da ferramenta no nxSystems). Sem a variável, o endereço fica aberto,
// o que não é problema porque o conteúdo é público.

export const dynamic = "force-dynamic";

const MAX_RESULTADOS = 12;
const SITE_PADRAO = "https://sbplace.com.br";

// ---------- leitura flexível da requisição ----------

function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function chave(nome) {
  return normalizar(nome).replace(/[^a-z0-9]+/g, "_");
}

function ehSimples(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}

// Percorre o corpo inteiro e devolve { chave: valor } só com os valores simples
// (texto/número). Também entende listas de pares { nome, valor }. Chaves
// repetidas: fica a primeira que tiver conteúdo.
function achatar(obj, saida = {}, profundidade = 0) {
  if (!obj || typeof obj !== "object" || profundidade > 6) return saida;
  const nomePar = obj.nome ?? obj.name ?? obj.key ?? obj.campo ?? obj.field;
  const valorPar = obj.valor ?? obj.value;
  if (!Array.isArray(obj) && typeof nomePar === "string" && ehSimples(valorPar)) {
    const k = chave(nomePar);
    if (!(k in saida) || saida[k] === "") saida[k] = valorPar;
    return saida;
  }
  for (const [nome, valor] of Object.entries(obj)) {
    if (valor === null || valor === undefined) continue;
    if (typeof valor === "object") {
      achatar(valor, saida, profundidade + 1);
    } else if (ehSimples(valor)) {
      const k = chave(nome);
      if (!(k in saida) || saida[k] === "") saida[k] = valor;
    }
  }
  return saida;
}

function primeiro(campos, nomes) {
  for (const nome of nomes) {
    const v = campos[nome];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}

async function lerEntrada(request) {
  const campos = {};
  for (const [k, v] of request.nextUrl.searchParams.entries()) {
    campos[chave(k)] = v;
  }
  if (request.method === "POST") {
    const bruto = await request.text().catch(() => "");
    if (bruto && bruto.trim()) {
      let corpo;
      try {
        corpo = JSON.parse(bruto);
      } catch {
        // pode ser formulário (a=1&b=2) ou texto puro
        corpo =
          bruto.includes("=") && !bruto.includes("\n")
            ? Object.fromEntries(new URLSearchParams(bruto).entries())
            : { pergunta: bruto };
      }
      achatar(corpo, campos);
    }
  }
  return campos;
}

// ---------- interpretação dos filtros ----------

const SINONIMOS_TIPO = [
  ["eletrica", ["eletrica", "eletrico", "e-bike", "ebike", "e bike", "motor", "bateria"]],
  ["mtb", ["mtb", "mountain", "montanha", "trilha", "xc", "cross", "full", "hardtail", "aro 29"]],
  ["speed", ["speed", "estrada", "road", "gravel", "aero"]],
  ["urbana", ["urbana", "urbano", "cidade", "passeio", "lazer"]],
  ["infantil", ["infantil", "crianca", "kids", "junior"]],
];

// Modelos conhecidos -> tipo. Serve para o caso "quero uma Razzo" (e-bike da
// Oggi): mesmo sem Razzo no estoque, dá para oferecer as outras e-bikes.
const MODELOS = [
  ["eletrica", ["razzo", "street go", "streetgo", "levo", "vado", "tero", "kenevo", "creo", "e-mtb", "emtb", "rise", "wild", "rail", "fuel exe", "powerfly", "e-stance", "trance x e", "reign e"]],
  ["mtb", ["big wheel", "cattura", "potenza", "agile", "float", "scale", "scalpel", "oiz", "alma", "epic", "stumpjumper", "chisel", "rockhopper", "fuse", "spark", "anthem", "trance", "supercaliber", "top fuel", "procaliber", "x-caliber"]],
  ["speed", ["tarmac", "roubaix", "aethos", "allez", "stimolla", "velloce", "domane", "emonda", "madone", "addict", "foil", "diverge", "crux"]],
];

// Palavras que não identificam um modelo (não entram na busca pelo nome).
const PALAVRAS_GENERICAS = new Set([
  "bike", "bicicleta", "seminova", "seminovas", "usada", "usadas", "nova", "quero", "uma", "tem", "voces", "vcs", "com", "para", "pra", "por", "ate",
  "mtb", "speed", "eletrica", "eletrico", "ebike", "mountain", "montanha", "trilha", "estrada", "road", "gravel", "urbana", "infantil", "aro", "full", "hardtail",
  "carbono", "aluminio", "barata", "barato", "mais", "menos", "opcoes", "opcao", "modelo", "modelos", "tamanho",
]);

function detectarTipo(texto) {
  const t = normalizar(texto);
  if (!t) return "";
  for (const [tipo, termos] of SINONIMOS_TIPO) {
    if (termos.some((termo) => t.includes(termo))) return tipo;
  }
  for (const [tipo, modelos] of MODELOS) {
    if (modelos.some((m) => t.includes(m))) return tipo;
  }
  return "";
}

// "R$ 20.000", "20 mil", "20k", "até 25000", "entre 15 e 20 mil" -> reais
function interpretarValor(entrada) {
  if (typeof entrada === "number") return entrada > 0 ? entrada : 0;
  const t = normalizar(entrada).replace(/r\$/g, " ");
  if (!t) return 0;
  const numeros = [...t.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?)\s*(mil|k)?/g)]
    .map((m) => {
      let n = m[1];
      n = /^\d{1,3}(\.\d{3})+$/.test(n) ? n.replace(/\./g, "") : n.replace(",", ".");
      let valor = parseFloat(n);
      if (m[2]) valor *= 1000;
      return valor;
    })
    .filter((n) => n > 0);
  if (!numeros.length) return 0;
  // quando vem uma faixa ("15 a 20 mil"), vale o maior
  let maior = Math.max(...numeros);
  // valor pequeno sem "mil" quase sempre é em milhares ("até 20")
  if (maior < 500) maior *= 1000;
  return maior;
}

// Valor dito no meio de uma frase: só com pista de dinheiro ("R$", "mil", "até").
function valorNoTexto(texto) {
  const t = normalizar(texto);
  const m =
    t.match(/r\$\s*[\d.,]+\s*(?:mil|k)?/) ||
    t.match(/[\d.,]+\s*(?:mil|k)\b/) ||
    t.match(/(?:ate|maximo|no maximo|teto de|limite de)\s*(?:de\s*)?(?:r\$\s*)?[\d.,]+/);
  return m ? interpretarValor(m[0]) : 0;
}

// "1,75", "175", "1.80 m", "1m78", "170cm" -> centímetros
function interpretarAltura(entrada) {
  const t = normalizar(entrada).replace(/\s+/g, "");
  const m = t.match(/(\d)[,.m](\d{2})/) || t.match(/(\d{3})/);
  if (!m) return 0;
  const cm = m[2] ? Number(m[1]) * 100 + Number(m[2]) : Number(m[1]);
  return cm >= 120 && cm <= 220 ? cm : 0;
}

// Altura dita no meio de uma frase: só com pista ("1,75 m", "175 cm", "altura 1,75").
function alturaNoTexto(texto) {
  const t = normalizar(texto);
  const m =
    t.match(/(\d)[,.](\d{2})\s*(?:m\b|metros?\b|de altura)/) ||
    t.match(/(\d{3})\s*cm\b/) ||
    t.match(/altura\s*(?:de|e|:|eh|é)?\s*(\d)[,.]?(\d{2})\b/);
  if (!m) return 0;
  return interpretarAltura(m[2] ? `${m[1]},${m[2]}` : m[1]);
}

// Chaves que carregam dados do contato/atendimento, não o que o cliente quer.
const CHAVES_IGNORADAS = /nome|name|telefone|phone|celular|whatsapp|email|protocolo|ticket|(^|_)id$|token|senha|password|secret|data|hora|date|time|url|link|canal|channel|fila|setor|agente|atendente|usuario|user|empresa|instancia|instance|session|sessao|uuid|origem/;

// Junta todos os textos do corpo que podem conter o pedido do cliente.
function textoGeral(campos) {
  return Object.entries(campos)
    .filter(([k, v]) => typeof v === "string" && v.length >= 3 && v.length <= 600 && !CHAVES_IGNORADAS.test(k))
    .map(([, v]) => v)
    .join(" \n ");
}

// Nomes de modelo conhecidos citados num texto livre ("quero uma razzo").
function modelosNoTexto(texto) {
  const t = normalizar(texto);
  const achados = [];
  for (const [, modelos] of MODELOS) {
    for (const m of modelos) {
      if (m.length >= 4 && t.includes(m) && !achados.includes(m)) achados.push(m);
    }
  }
  return achados;
}

// ---------- tamanho x altura ----------

// Faixas de referência (cm). Só orientam a ordem e o aviso "serve para a
// altura": quem confirma o tamanho é o consultor.
const FAIXAS_LETRA = {
  xs: [148, 160], s1: [148, 160],
  s: [155, 170], s2: [155, 172],
  m: [165, 180], s3: [165, 180],
  l: [175, 188], s4: [175, 188],
  xl: [185, 196], s5: [185, 196],
  xxl: [190, 205], s6: [190, 205],
};
const FAIXAS_POLEGADA = { 13: [145, 158], 15: [155, 167], 16: [160, 170], 17: [165, 177], 18: [170, 182], 19: [175, 187], 20: [180, 190], 21: [185, 196] };
const FAIXAS_ROAD = { 44: [145, 152], 47: [150, 158], 49: [155, 163], 52: [162, 170], 54: [168, 176], 56: [174, 182], 58: [180, 188], 61: [186, 196], 64: [192, 205] };

function faixaDoTamanho(tamanho, categoria) {
  const t = normalizar(tamanho);
  if (!t) return null;
  // faixa escrita na própria ficha: "1,70 a 1,78 m" / "1.65-1.80"
  const explicita = t.match(/(\d)[,.](\d{2})\s*(?:a|-|ate|~)\s*(\d)[,.](\d{2})/);
  if (explicita) {
    return [Number(explicita[1]) * 100 + Number(explicita[2]), Number(explicita[3]) * 100 + Number(explicita[4])];
  }
  const letra = t.match(/\b(xxl|xl|xs|s[1-6]|s|m|l)\b/);
  if (letra && FAIXAS_LETRA[letra[1]]) return FAIXAS_LETRA[letra[1]];
  const numero = t.match(/\b(\d{2})(?:[.,]5)?\b/);
  if (numero) {
    const n = Number(numero[1]);
    if (categoria === "speed" && FAIXAS_ROAD[n]) return FAIXAS_ROAD[n];
    if (FAIXAS_POLEGADA[n]) return FAIXAS_POLEGADA[n];
    if (FAIXAS_ROAD[n]) return FAIXAS_ROAD[n];
  }
  return null;
}

function serveAltura(faixa, alturaCm) {
  if (!faixa || !alturaCm) return null;
  const folga = 2;
  return alturaCm >= faixa[0] - folga && alturaCm <= faixa[1] + folga;
}

// ---------- montagem da resposta ----------

// Primeiro rótulo que existir na ficha, na ordem pedida ("Tamanho" antes de
// "Quadro", por exemplo — "Quadro" na ficha costuma ser o material, não o tamanho).
function spec(bike, ...rotulos) {
  const specs = bike.specs || [];
  for (const rotulo of rotulos) {
    const item = specs.find((s) => normalizar(s.label) === normalizar(rotulo));
    if (item && item.value) return item.value;
  }
  return "";
}

function tamanhoDaBike(bike) {
  const daFicha = spec(bike, "Tamanho do quadro", "Tamanho", "Tam.", "Tam");
  const doSubtitulo = String(bike.subtitle || "").replace(/^tamanho\s*:?\s*/i, "");
  return daFicha || doSubtitulo;
}

function baseDoSite(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return SITE_PADRAO;
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}`;
}

function resumirBike(bike, base, alturaCm) {
  const categoria = CATEGORIES.find((c) => c.value === bike.category)?.label || bike.category || "";
  const { count, valueCents } = installmentInfo(bike);
  const tamanho = tamanhoDaBike(bike);
  const faixa = faixaDoTamanho(tamanho, bike.category);
  const avistaCents = bike.cashPriceCents > 0 ? bike.cashPriceCents : bike.priceCents;
  return {
    nome: bike.name,
    tipo: categoria,
    tamanho,
    ano: spec(bike, "Ano", "Ano/Modelo", "Ano modelo"),
    preco_vista: formatPrice(avistaCents),
    parcelado: bike.priceCents ? `${count}x de ${formatPrice(valueCents)} sem juros` : "",
    serve_para_altura: serveAltura(faixa, alturaCm),
    link: `${base}/bicicletas/${bike.slug}`,
    em_revisao: isInReview(bike),
    avistaCents,
  };
}

function linhaDeTexto(b, i) {
  const partes = [b.nome];
  if (b.tamanho) partes.push(`tamanho ${b.tamanho}`);
  if (b.ano) partes.push(`ano ${b.ano}`);
  partes.push(`${b.preco_vista} à vista`);
  if (b.parcelado) partes.push(`ou ${b.parcelado}`);
  if (b.serve_para_altura === true) partes.push("serve para a altura informada");
  if (b.serve_para_altura === false) partes.push("tamanho provavelmente não serve para a altura informada");
  if (b.em_revisao) partes.push("EM REVISÃO na oficina, logo fica liberada");
  return `${i + 1}) ${partes.join(" — ")} — ${b.link}`;
}

function autorizado(request, campos) {
  const esperado = process.env.LIA_TOKEN;
  if (!esperado) return true;
  const autorizacao = request.headers.get("authorization") || "";
  const candidatos = [
    request.headers.get("x-lia-token"),
    request.headers.get("x-token"),
    request.headers.get("x-api-key"),
    request.headers.get("x-senha"),
    autorizacao.replace(/^(bearer|basic)\s+/i, ""),
    primeiro(campos, ["token", "senha", "senha_de_acesso", "password", "secret", "api_key", "apikey", "chave"]),
  ];
  return candidatos.some((c) => c && String(c) === esperado);
}

async function responder(request) {
  const campos = await lerEntrada(request);
  if (!autorizado(request, campos)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const textoModelo = String(
    primeiro(campos, ["modelo", "modelo_da_bike", "modelo_desejado", "nome_do_modelo", "bike", "bike_desejada", "busca", "q"])
  );
  const textoLivre = String(
    primeiro(campos, [
      "modelo", "modelo_da_bike", "modelo_desejado", "nome_do_modelo", "bike", "bike_desejada", "busca", "q",
      "pergunta", "mensagem", "texto", "query", "question", "message", "input", "consulta", "prompt",
      "duvida", "solicitacao", "pedido", "descricao", "conteudo", "content", "text", "msg", "body",
    ])
  );
  // Sem campos conhecidos, procura pistas em todo o texto do corpo.
  const geral = textoLivre ? "" : textoGeral(campos);

  const tipoInformado = String(primeiro(campos, ["tipo", "tipo_de_bike", "tipo_da_bike", "categoria", "modalidade"]));
  const tipo = detectarTipo(tipoInformado) || detectarTipo(textoLivre) || detectarTipo(geral);

  const valorMaximo =
    interpretarValor(primeiro(campos, ["valor_maximo", "valor_max", "valor", "orcamento", "faixa_de_valor", "preco_maximo", "preco", "budget", "investimento"])) ||
    valorNoTexto(textoLivre) ||
    valorNoTexto(geral);

  const alturaCm =
    interpretarAltura(primeiro(campos, ["altura", "altura_cm", "altura_do_cliente", "height"])) ||
    alturaNoTexto(textoLivre) ||
    alturaNoTexto(geral);

  // palavras do modelo pedido (ex.: "razzo", "levo comp") para procurar no nome;
  // sem campo de modelo, vale um modelo conhecido citado no texto
  const termosModelo = textoModelo
    ? normalizar(textoModelo)
        .split(/[^a-z0-9]+/)
        .filter((p) => p.length >= 3 && !PALAVRAS_GENERICAS.has(p))
    : modelosNoTexto(textoLivre || geral);

  const base = baseDoSite(request);
  const todas = listBikes({ onlyPublic: true, condition: "seminova" })
    .filter((b) => b.status === "disponivel")
    .map((b) => ({ bike: b, r: resumirBike(b, base, alturaCm) }));

  const avisos = [];
  let lista = todas;

  // 1) modelo específico ("razzo", "levo comp")
  let modeloEncontrado = false;
  if (termosModelo.length) {
    const porModelo = lista.filter(({ bike }) => {
      const nome = normalizar(bike.name);
      return termosModelo.every((termo) => nome.includes(termo));
    });
    if (porModelo.length) {
      lista = porModelo;
      modeloEncontrado = true;
    } else {
      avisos.push(`Nenhuma seminova "${termosModelo.join(" ")}" em estoque no momento.`);
    }
  }

  // 2) tipo (quando o modelo pedido não existe, oferece as do mesmo tipo)
  if (!modeloEncontrado && tipo) {
    const porTipo = lista.filter(({ bike }) => bike.category === tipo);
    if (porTipo.length) {
      lista = porTipo;
    } else {
      const rotulo = (CATEGORIES.find((c) => c.value === tipo)?.label || tipo).toLowerCase();
      avisos.push(`Nenhuma seminova de ${rotulo} em estoque no momento; seguem as demais.`);
    }
  }

  // Modelo pedido não existe e não dá para saber o tipo: não adianta mandar
  // uma lista misturada (quem pediu e-bike não quer MTB sem motor).
  if (termosModelo.length && !modeloEncontrado && !tipo) {
    const porTipo = {};
    for (const { bike } of todas) {
      const rotulo = (CATEGORIES.find((c) => c.value === bike.category)?.label || bike.category).toLowerCase();
      porTipo[rotulo] = (porTipo[rotulo] || 0) + 1;
    }
    const resumo = Object.entries(porTipo).map(([r, n]) => `${r} (${n})`).join(", ");
    avisos.push(
      `Tipo da bike pedida não identificado. Pergunte ao cliente se procura e-bike, MTB ou speed e consulte de novo informando o tipo. Seminovas disponíveis por tipo: ${resumo}.`
    );
    lista = [];
  }

  // 3) valor máximo (10% de folga: a condição final é com o consultor)
  if (valorMaximo > 0) {
    const limite = valorMaximo * 100 * 1.1;
    const dentro = lista.filter(({ r }) => r.avistaCents <= limite);
    if (dentro.length) {
      lista = dentro;
    } else {
      avisos.push(`Nenhuma até ${formatPrice(valorMaximo * 100)}; seguem as de menor valor.`);
      lista = [...lista].sort((a, b) => a.r.avistaCents - b.r.avistaCents).slice(0, 3);
    }
  }

  // ordem: serve para a altura primeiro, depois preço crescente
  const pesoAltura = (r) => (r.serve_para_altura === true ? 0 : r.serve_para_altura === null ? 1 : 2);
  lista = [...lista].sort((a, b) => pesoAltura(a.r) - pesoAltura(b.r) || a.r.avistaCents - b.r.avistaCents);

  const bikes = lista.slice(0, MAX_RESULTADOS).map(({ r }) => {
    const { avistaCents, ...publico } = r;
    return publico;
  });

  if (bikes.some((b) => b.em_revisao)) {
    avisos.push(
      "Bike marcada como EM REVISÃO: ao oferecer, avise o cliente que ela está em revisão na oficina e logo fica liberada."
    );
  }

  const rotuloTipo = tipo ? (CATEGORIES.find((c) => c.value === tipo)?.label || tipo).toLowerCase() : "";
  let cabecalho;
  if (!bikes.length) {
    cabecalho = avisos.length ? "Nenhuma opção enviada." : "Nenhuma seminova disponível no momento.";
  } else {
    cabecalho = `${bikes.length} seminova(s) disponível(is)`;
    if (rotuloTipo && !modeloEncontrado && !avisos.some((a) => a.includes("Nenhuma seminova de"))) cabecalho += ` de ${rotuloTipo}`;
    if (valorMaximo && !avisos.some((a) => a.startsWith("Nenhuma até"))) cabecalho += ` até ${formatPrice(valorMaximo * 100)}`;
    if (lista.length > bikes.length) cabecalho += ` (mostrando ${bikes.length} de ${lista.length})`;
    cabecalho += ". Seminovas: até 21x sem juros no cartão, frete grátis para todo o Brasil.";
  }

  const resposta = [...avisos, cabecalho, ...bikes.map(linhaDeTexto)].join("\n");

  return NextResponse.json(
    {
      resposta,
      consulta: {
        modelo: termosModelo.join(" ") || null,
        tipo: tipo || null,
        valor_maximo: valorMaximo || null,
        altura_cm: alturaCm || null,
      },
      avisos,
      total_disponiveis: todas.length,
      bikes,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request) {
  return responder(request);
}

export async function POST(request) {
  return responder(request);
}
