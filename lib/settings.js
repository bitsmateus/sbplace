import { readStore, writeStore } from "./db";
import { removeUploadFile } from "./upload-files";

// Institutional content the shop owner can edit from the admin panel
// (About, differentiators, hours, address, team) without touching code.

// "about" and "differentials" are left blank on purpose — the shop owner
// fills those in through /admin/configuracoes. "hours" ships with the real
// schedule provided by the owner.
export function defaultSettings() {
  return {
    about: "",
    differentials: [],
    hours:
      "Segunda a sexta: 10:00–12:00, 13:30–19:30\nSábado: 08:00–12:00\nDomingo: Fechado",
    addressLine: "Av. Marcolino Martins Cabral, 2225 - Vila Moema",
    legalName: "",
    cnpj: "",
    team: [],
  };
}

// Um integrante da equipe: foto (arquivo enviado pelo admin), nome e cargo.
// "hidden" guarda quem saiu de férias/da loja sem perder o cadastro.
function normalizeMember(m) {
  return {
    name: String(m.name || "").trim(),
    role: String(m.role || "").trim(),
    photo: m.photo ? String(m.photo) : "",
    hidden: Boolean(m.hidden),
  };
}

export function getSettings() {
  const { settings } = readStore();
  const defaults = defaultSettings();
  return {
    about: settings.about || defaults.about,
    differentials:
      Array.isArray(settings.differentials) && settings.differentials.length > 0
        ? settings.differentials
        : defaults.differentials,
    hours: settings.hours || defaults.hours,
    addressLine: settings.addressLine || defaults.addressLine,
    legalName: settings.legalName || defaults.legalName,
    cnpj: settings.cnpj || defaults.cnpj,
    team: Array.isArray(settings.team) ? settings.team.map(normalizeMember) : [],
  };
}

// Só os que aparecem no site, na ordem cadastrada.
export function getVisibleTeam() {
  return getSettings().team.filter((m) => !m.hidden && m.name);
}

export function updateSettings(data) {
  const store = readStore();
  const next = { ...store.settings };

  if (typeof data.about === "string") next.about = data.about;
  if (typeof data.hours === "string") next.hours = data.hours;
  if (typeof data.addressLine === "string") next.addressLine = data.addressLine;
  if (typeof data.legalName === "string") next.legalName = data.legalName.trim();
  if (typeof data.cnpj === "string") next.cnpj = data.cnpj.trim();
  if (Array.isArray(data.differentials)) {
    next.differentials = data.differentials
      .filter((d) => d && (d.title || d.description))
      .map((d) => ({
        title: String(d.title || ""),
        description: String(d.description || ""),
      }));
  }
  if (Array.isArray(data.team)) {
    const before = Array.isArray(store.settings.team) ? store.settings.team : [];
    next.team = data.team
      .filter((m) => m && (m.name || m.role || m.photo))
      .map(normalizeMember);

    // apaga do disco as fotos de quem foi removido (ou trocou de foto)
    const kept = new Set(next.team.map((m) => m.photo).filter(Boolean));
    for (const old of before) {
      if (old?.photo && !kept.has(old.photo)) removeUploadFile(old.photo);
    }
  }

  store.settings = next;
  writeStore(store);
  return getSettings();
}
