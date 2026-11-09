// Tamanho do quadro para o filtro do catálogo.
// Só constantes/funções puras — sem banco — então pode ser importado também
// por componentes de cliente.
//
// O tamanho não é um campo próprio da bike: ele é lido do item "Tamanho" (ou
// "Tamanhos", "Tamanho do quadro") da ficha técnica e, se a ficha não tiver,
// do subtítulo quando ele começa com "Tamanho". Exemplos do que a loja escreve:
//   "56"  ·  "L (19)"  ·  "S3 (M)"  ·  "P (15)"  ·  "54 e 56"
//   "49, 52, 54, 56, 58"  ·  "Tamanho S5 · para quem tem de 1,83 a 1,93"

const ROTULOS = ["tamanho do quadro", "tamanhos do quadro", "tamanho", "tamanhos", "tam.", "tam"];

// Três jeitos de medir quadro, mostrados em grupos separados no filtro.
const LETRAS = ["XS", "S", "M", "L", "XL", "XXL"];
const S_SIZING = ["S1", "S2", "S3", "S4", "S5", "S6"];
export const GRUPOS_TAMANHO = [
  { id: "letra", label: "Por letra" },
  { id: "ssizing", label: "Specialized S-Sizing" },
  { id: "numero", label: "Por número (speed)" },
];

// Letras em português viram a letra usada no resto do site.
const LETRA_PT = { PP: "XS", P: "S", G: "L", GG: "XL", XG: "XL", XGG: "XXL" };
// Quadro escrito só em polegadas (MTB) vira a letra equivalente.
const POLEGADA = { 13: "XS", 14: "XS", 15: "S", 16: "S", 17: "M", 18: "M", 19: "L", 20: "L", 21: "XL", 22: "XL", 23: "XXL" };

function semAcento(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Um pedaço de texto ("56", "l", "S3", "17,5") -> tamanho padronizado, ou "".
export function normalizarTamanho(texto) {
  const t = semAcento(texto).toUpperCase().replace(/["”]/g, "").trim();
  if (!t) return "";
  if (LETRAS.includes(t) || S_SIZING.includes(t)) return t;
  if (LETRA_PT[t]) return LETRA_PT[t];
  const numero = t.match(/^(\d{2})(?:[.,]\d)?$/);
  if (numero) {
    const n = Number(numero[1]);
    if (n >= 40 && n <= 66) return String(n); // quadro de speed, em cm
    if (POLEGADA[n]) return POLEGADA[n];
  }
  return "";
}

function textoDoTamanho(bike) {
  const specs = Array.isArray(bike?.specs) ? bike.specs : [];
  for (const rotulo of ROTULOS) {
    const item = specs.find((s) => semAcento(s?.label).toLowerCase().trim() === rotulo);
    if (item?.value) return String(item.value);
  }
  const subtitulo = String(bike?.subtitle || "").match(/^\s*tamanhos?\s*:?\s*(.+)$/i);
  return subtitulo ? subtitulo[1] : "";
}

// Tamanhos de uma bike, já padronizados. Seminova costuma ter um só; bike nova
// tem a lista de tamanhos do modelo.
export function tamanhosDaBike(bike) {
  const texto = textoDoTamanho(bike)
    .split("·")[0] // corta o "· para quem tem de 1,83 a 1,93"
    .replace(/\([^)]*\)/g, " ") // tira o que está entre parênteses: "L (19)" -> "L"
    .replace(/(\d{2}),(\d)(?!\d)/g, "$1.$2"); // "17,5" -> "17.5", para não quebrar na vírgula
  const achados = [];
  for (const parte of texto.split(/\s*(?:,|;|\/|\be\b)\s*/i)) {
    const tamanho = normalizarTamanho(parte);
    if (tamanho && !achados.includes(tamanho)) achados.push(tamanho);
  }
  return achados;
}

function grupoDoTamanho(tamanho) {
  if (LETRAS.includes(tamanho)) return "letra";
  if (S_SIZING.includes(tamanho)) return "ssizing";
  return "numero";
}

function ordem(tamanho) {
  const letra = LETRAS.indexOf(tamanho);
  if (letra !== -1) return letra;
  const s = S_SIZING.indexOf(tamanho);
  if (s !== -1) return s;
  return Number(tamanho);
}

// Opções do filtro para uma lista de bikes: só os tamanhos que existem nela,
// agrupados e em ordem. Bike vendida não cria opção (levaria a uma lista só de
// vendidas); `sempreIncluir` garante que o tamanho já escolhido continue na lista.
export function opcoesDeTamanho(bikes, sempreIncluir = "") {
  const existentes = new Set();
  for (const bike of bikes) {
    if (bike.status === "vendida") continue;
    for (const t of tamanhosDaBike(bike)) existentes.add(t);
  }
  if (sempreIncluir) existentes.add(sempreIncluir);
  return GRUPOS_TAMANHO.map((grupo) => ({
    ...grupo,
    tamanhos: [...existentes]
      .filter((t) => grupoDoTamanho(t) === grupo.id)
      .sort((a, b) => ordem(a) - ordem(b)),
  })).filter((grupo) => grupo.tamanhos.length > 0);
}
