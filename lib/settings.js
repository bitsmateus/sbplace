import { readStore, writeStore } from "./db";

// Institutional content the shop owner can edit from the admin panel
// (About, differentiators, hours, address) without touching code.

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
  };
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

  store.settings = next;
  writeStore(store);
  return getSettings();
}
