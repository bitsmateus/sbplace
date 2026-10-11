// Prazo de entrega das seminovas, calculado pelo CEP do cliente.
// Só constantes e funções puras — pode ser importado em Client Components.

// Dias úteis entre o fechamento da compra e a coleta da bike pela
// transportadora (revisão + embalagem + coleta).
export const DIAS_PARA_DESPACHO = 2;

// Prazo de transporte (dias úteis) por estado: capital / interior
// ("de" é só para escrever "interior do Paraná", "interior da Bahia"...).
// Fonte: calculadora de frete da Shopbike (mesmas transportadoras, saindo de
// Tubarão/SC), consultada em 10/2026. Sul, Sudeste e Centro-Oeste: prazo do
// frete grátis; Norte e Nordeste: transportadora mais barata; interior: maior
// prazo encontrado no estado. Para mudar um prazo, é só editar o número aqui.
export const PRAZOS_POR_UF = {
  AC: { estado: "Acre", de: "do", capital: "Rio Branco", diasCapital: 18, diasInterior: 18 },
  AL: { estado: "Alagoas", de: "de", capital: "Maceió", diasCapital: 14, diasInterior: 18 },
  AM: { estado: "Amazonas", de: "do", capital: "Manaus", diasCapital: 30, diasInterior: 30 },
  AP: { estado: "Amapá", de: "do", capital: "Macapá", diasCapital: 26, diasInterior: 26 },
  BA: { estado: "Bahia", de: "da", capital: "Salvador", diasCapital: 12, diasInterior: 17 },
  CE: { estado: "Ceará", de: "do", capital: "Fortaleza", diasCapital: 16, diasInterior: 21 },
  DF: { estado: "Distrito Federal", de: "do", capital: "Brasília", diasCapital: 12, diasInterior: 12 },
  ES: { estado: "Espírito Santo", de: "do", capital: "Vitória", diasCapital: 8, diasInterior: 8 },
  GO: { estado: "Goiás", de: "de", capital: "Goiânia", diasCapital: 10, diasInterior: 10 },
  MA: { estado: "Maranhão", de: "do", capital: "São Luís", diasCapital: 18, diasInterior: 22 },
  MG: { estado: "Minas Gerais", de: "de", capital: "Belo Horizonte", diasCapital: 7, diasInterior: 9 },
  MS: { estado: "Mato Grosso do Sul", de: "de", capital: "Campo Grande", diasCapital: 11, diasInterior: 11 },
  MT: { estado: "Mato Grosso", de: "de", capital: "Cuiabá", diasCapital: 11, diasInterior: 16 },
  PA: { estado: "Pará", de: "do", capital: "Belém", diasCapital: 17, diasInterior: 17 },
  PB: { estado: "Paraíba", de: "da", capital: "João Pessoa", diasCapital: 17, diasInterior: 20 },
  PE: { estado: "Pernambuco", de: "de", capital: "Recife", diasCapital: 14, diasInterior: 19 },
  PI: { estado: "Piauí", de: "do", capital: "Teresina", diasCapital: 17, diasInterior: 22 },
  PR: { estado: "Paraná", de: "do", capital: "Curitiba", diasCapital: 6, diasInterior: 7 },
  RJ: { estado: "Rio de Janeiro", de: "do", capital: "Rio de Janeiro", diasCapital: 9, diasInterior: 9 },
  RN: { estado: "Rio Grande do Norte", de: "do", capital: "Natal", diasCapital: 18, diasInterior: 22 },
  RO: { estado: "Rondônia", de: "de", capital: "Porto Velho", diasCapital: 14, diasInterior: 14 },
  RR: { estado: "Roraima", de: "de", capital: "Boa Vista", diasCapital: 31, diasInterior: 31 },
  RS: { estado: "Rio Grande do Sul", de: "do", capital: "Porto Alegre", diasCapital: 6, diasInterior: 10 },
  SC: { estado: "Santa Catarina", de: "de", capital: "Florianópolis", diasCapital: 6, diasInterior: 6 },
  SE: { estado: "Sergipe", de: "de", capital: "Aracaju", diasCapital: 13, diasInterior: 17 },
  SP: { estado: "São Paulo", de: "de", capital: "São Paulo", diasCapital: 9, diasInterior: 9 },
  TO: { estado: "Tocantins", de: "do", capital: "Palmas", diasCapital: 7, diasInterior: 9 },
};

// Faixas de CEP dos Correios (5 primeiros dígitos) de cada estado.
const FAIXAS_UF = [
  [1000, 19999, "SP"],
  [20000, 28999, "RJ"],
  [29000, 29999, "ES"],
  [30000, 39999, "MG"],
  [40000, 48999, "BA"],
  [49000, 49999, "SE"],
  [50000, 56999, "PE"],
  [57000, 57999, "AL"],
  [58000, 58999, "PB"],
  [59000, 59999, "RN"],
  [60000, 63999, "CE"],
  [64000, 64999, "PI"],
  [65000, 65999, "MA"],
  [66000, 68899, "PA"],
  [68900, 68999, "AP"],
  [69000, 69299, "AM"],
  [69300, 69399, "RR"],
  [69400, 69899, "AM"],
  [69900, 69999, "AC"],
  [70000, 72799, "DF"],
  [72800, 72999, "GO"],
  [73000, 73699, "DF"],
  [73700, 76799, "GO"],
  [76800, 76999, "RO"],
  [77000, 77999, "TO"],
  [78000, 78899, "MT"],
  [79000, 79999, "MS"],
  [80000, 87999, "PR"],
  [88000, 89999, "SC"],
  [90000, 99999, "RS"],
];

// Faixas de CEP das capitais (usadas quando a busca da cidade não responde).
const FAIXAS_CAPITAL = {
  AC: [[69900, 69923]],
  AL: [[57000, 57099]],
  AM: [[69000, 69099]],
  AP: [[68900, 68911]],
  BA: [[40000, 42599]],
  CE: [[60000, 61599]],
  DF: [[70000, 72799], [73000, 73699]],
  ES: [[29000, 29099]],
  GO: [[74000, 74899]],
  MA: [[65000, 65109]],
  MG: [[30000, 31999]],
  MS: [[79000, 79124]],
  MT: [[78000, 78109]],
  PA: [[66000, 66999]],
  PB: [[58000, 58099]],
  PE: [[50000, 52999]],
  PI: [[64000, 64099]],
  PR: [[80000, 82999]],
  RJ: [[20000, 23799]],
  RN: [[59000, 59139]],
  RO: [[76800, 76834]],
  RR: [[69300, 69339]],
  RS: [[90000, 91999]],
  SC: [[88000, 88099]],
  SE: [[49000, 49099]],
  SP: [[1000, 5999], [8000, 8499]],
  TO: [[77000, 77299]],
};

const DIA = 24 * 60 * 60 * 1000;
const SEMANA = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];

export function limparCep(valor) {
  return String(valor ?? "").replace(/\D/g, "").slice(0, 8);
}

// "88701000" → "88701-000" (também formata enquanto o cliente digita).
export function formatarCep(valor) {
  const d = limparCep(valor);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function prefixo(cep) {
  return Number(limparCep(cep).slice(0, 5));
}

export function ufDoCep(cep) {
  const p = prefixo(cep);
  const faixa = FAIXAS_UF.find(([de, ate]) => p >= de && p <= ate);
  return faixa ? faixa[2] : null;
}

function cepNaCapital(cep, uf) {
  const p = prefixo(cep);
  return (FAIXAS_CAPITAL[uf] || []).some(([de, ate]) => p >= de && p <= ate);
}

function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Datas são tratadas como meia-noite UTC do dia (número em ms), para a conta
// não depender do fuso nem do horário de verão do aparelho do cliente.
export function hojeNoBrasil(agora = new Date()) {
  const partes = {};
  for (const p of new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(agora)) {
    partes[p.type] = p.value;
  }
  return Date.UTC(Number(partes.year), Number(partes.month) - 1, Number(partes.day));
}

// Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher).
function pascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(ano, mes - 1, dia);
}

// Feriados nacionais. Carnaval e Corpus Christi são ponto facultativo, mas as
// transportadoras costumam parar — contamos como feriado para não prometer
// antes da hora.
const feriadosPorAno = new Map();
function feriados(ano) {
  if (!feriadosPorAno.has(ano)) {
    const fixos = [[1, 1], [4, 21], [5, 1], [9, 7], [10, 12], [11, 2], [11, 15], [11, 20], [12, 25]]
      .map(([mes, dia]) => Date.UTC(ano, mes - 1, dia));
    const p = pascoa(ano);
    const moveis = [p - 48 * DIA, p - 47 * DIA, p - 2 * DIA, p + 60 * DIA];
    feriadosPorAno.set(ano, new Set([...fixos, ...moveis]));
  }
  return feriadosPorAno.get(ano);
}

function ehDiaUtil(t) {
  const data = new Date(t);
  const semana = data.getUTCDay();
  if (semana === 0 || semana === 6) return false;
  return !feriados(data.getUTCFullYear()).has(t);
}

// Soma dias úteis: o 1º dia contado é o dia útil seguinte a `inicio`.
export function somarDiasUteis(inicio, quantidade) {
  let t = inicio;
  let contados = 0;
  while (contados < quantidade) {
    t += DIA;
    if (ehDiaUtil(t)) contados += 1;
  }
  return t;
}

// → "ter., 27/10"
export function formatarData(t) {
  const data = new Date(t);
  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${SEMANA[data.getUTCDay()]}, ${dia}/${mes}`;
}

// Calcula o prazo para um CEP. `local` é a cidade/UF devolvida pela busca de
// CEP (opcional): com ela, a capital é identificada pelo nome da cidade; sem
// ela, pelas faixas de CEP. Devolve null se o CEP não é válido.
export function calcularEntrega(cep, local = {}, hoje = hojeNoBrasil()) {
  const digitos = limparCep(cep);
  if (digitos.length !== 8) return null;

  const uf = PRAZOS_POR_UF[local.uf] ? local.uf : ufDoCep(digitos);
  const info = PRAZOS_POR_UF[uf];
  if (!info) return null;

  const temCidade = Boolean(local.cidade) && local.uf === uf;
  const capital = temCidade
    ? normalizar(local.cidade) === normalizar(info.capital)
    : cepNaCapital(digitos, uf);
  const dias = capital ? info.diasCapital : info.diasInterior;

  // A transportadora conta o prazo a partir do dia seguinte à coleta.
  const coleta = somarDiasUteis(hoje, DIAS_PARA_DESPACHO);
  const previsao = somarDiasUteis(coleta, dias);

  return {
    cep: formatarCep(digitos),
    uf,
    estado: info.estado,
    interior: `interior ${info.de} ${info.estado}`,
    cidade: temCidade ? local.cidade : capital ? info.capital : "",
    capital,
    dias,
    previsao,
    // cliente de Tubarão: dá para retirar na loja
    naCidadeDaLoja: temCidade && uf === "SC" && normalizar(local.cidade) === "tubarao",
  };
}
