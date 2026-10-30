import { readStore, writeStore } from "./db";

// Contatos deixados no formulário rápido do site (nome + WhatsApp).
// Serve para não perder o cliente que chega pela campanha, olha o site e sai
// sem chamar no WhatsApp. Ficam na aba "Contatos" do painel.

export const LEAD_STATUS = [
  { value: "novo", label: "Novo" },
  { value: "chamado", label: "Já chamei" },
  { value: "descartado", label: "Descartado" },
];

const DUPLICADO_MS = 24 * 60 * 60 * 1000;

export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

// Aceita (48) 99999-9999, 48999999999 ou com 55 na frente. Devolve só o
// DDD + número (10 ou 11 dígitos) ou "" se não for um telefone válido.
export function normalizePhone(value) {
  let d = onlyDigits(value);
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  if (d.length < 10 || d.length > 11) return "";
  if (d.startsWith("0")) return "";
  return d;
}

export function formatPhone(d) {
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

function clean(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function listLeads({ status = "" } = {}) {
  const { leads } = readStore();
  return leads
    .filter((l) => !status || l.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function countLeadsByStatus() {
  const counts = {};
  for (const l of readStore().leads) counts[l.status] = (counts[l.status] || 0) + 1;
  return counts;
}

// Grava o contato. Se o mesmo telefone já mandou nas últimas 24h, só
// atualiza (evita contato repetido quando a pessoa envia duas vezes).
export function createLead(data) {
  const store = readStore();
  const phone = normalizePhone(data.phone);
  const now = new Date();
  const lead = {
    name: clean(data.name, 80),
    phone,
    page: clean(data.page, 200),
    pageTitle: clean(data.pageTitle, 120),
    origem: clean(data.origem, 80) || "site",
  };

  const recente = store.leads.find(
    (l) => l.phone === phone && now - new Date(l.createdAt) < DUPLICADO_MS
  );
  if (recente) {
    Object.assign(recente, lead, { updatedAt: now.toISOString() });
    writeStore(store);
    return recente;
  }

  const novo = {
    id: store.nextLeadId,
    ...lead,
    status: "novo",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  store.nextLeadId += 1;
  store.leads.push(novo);
  // guarda os 2.000 mais recentes para o arquivo não crescer sem limite
  if (store.leads.length > 2000) store.leads = store.leads.slice(-2000);
  writeStore(store);
  return novo;
}

export function updateLeadStatus(id, status) {
  if (!LEAD_STATUS.some((s) => s.value === status)) return null;
  const store = readStore();
  const lead = store.leads.find((l) => l.id === Number(id));
  if (!lead) return null;
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  writeStore(store);
  return lead;
}

export function deleteLead(id) {
  const store = readStore();
  const before = store.leads.length;
  store.leads = store.leads.filter((l) => l.id !== Number(id));
  if (store.leads.length === before) return false;
  writeStore(store);
  return true;
}
