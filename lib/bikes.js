import { readStore, writeStore } from "./db";

export { CATEGORIES, STATUS, formatPrice } from "./bike-constants";

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(bikes, base, ignoreId) {
  let slug = base || "bicicleta";
  let n = 1;
  while (bikes.some((b) => b.slug === slug && b.id !== ignoreId)) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function sortBikes(bikes) {
  return [...bikes].sort((a, b) => {
    if (!!b.featured !== !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if (a.position !== b.position) return a.position - b.position;
    return b.id - a.id;
  });
}

export function listBikes({ category, status, condition, search, onlyPublic } = {}) {
  const { bikes } = readStore();
  let result = bikes;
  if (onlyPublic) {
    result = result.filter((b) => b.status !== "oculta");
  }
  if (category) {
    result = result.filter((b) => b.category === category);
  }
  if (status) {
    result = result.filter((b) => b.status === status);
  }
  if (condition) {
    // bikes cadastradas antes do campo existir contam como novas
    result = result.filter((b) => (b.condition || "nova") === condition);
  }
  if (search) {
    const needle = search.toLowerCase();
    result = result.filter(
      (b) =>
        b.name.toLowerCase().includes(needle) ||
        (b.description || "").toLowerCase().includes(needle)
    );
  }
  return sortBikes(result);
}

export function getBikeBySlug(slug) {
  const { bikes } = readStore();
  return bikes.find((b) => b.slug === slug) || null;
}

export function getBikeById(id) {
  const { bikes } = readStore();
  return bikes.find((b) => b.id === Number(id)) || null;
}

export function createBike(data) {
  const store = readStore();
  const now = new Date().toISOString();
  const slug = uniqueSlug(store.bikes, slugify(data.name));
  const bike = {
    id: store.nextId,
    slug,
    name: data.name,
    category: data.category || "urbana",
    condition: data.condition === "seminova" ? "seminova" : "nova",
    subtitle: data.subtitle || "",
    priceCents: data.priceCents || 0,
    cashPriceCents: data.cashPriceCents || 0,
    installments: data.installments || 0,
    installmentValueCents: data.installmentValueCents || 0,
    description: data.description || "",
    status: data.status || "disponivel",
    featured: !!data.featured,
    images: data.images || [],
    position: data.position || 0,
    createdAt: now,
    updatedAt: now,
  };
  store.bikes.push(bike);
  store.nextId += 1;
  writeStore(store);
  return bike;
}

export function updateBike(id, data) {
  const store = readStore();
  const idx = store.bikes.findIndex((b) => b.id === Number(id));
  if (idx === -1) return null;
  const existing = store.bikes[idx];
  let slug = existing.slug;
  if (data.name && data.name !== existing.name) {
    slug = uniqueSlug(store.bikes, slugify(data.name), existing.id);
  }
  const updated = {
    ...existing,
    slug,
    name: data.name ?? existing.name,
    category: data.category ?? existing.category,
    condition:
      data.condition === "nova" || data.condition === "seminova"
        ? data.condition
        : existing.condition ?? "nova",
    subtitle: data.subtitle ?? existing.subtitle ?? "",
    priceCents: data.priceCents ?? existing.priceCents,
    cashPriceCents: data.cashPriceCents ?? existing.cashPriceCents ?? 0,
    installments: data.installments ?? existing.installments ?? 0,
    installmentValueCents:
      data.installmentValueCents ?? existing.installmentValueCents ?? 0,
    description: data.description ?? existing.description,
    status: data.status ?? existing.status,
    featured: data.featured !== undefined ? !!data.featured : existing.featured,
    images: data.images ?? existing.images,
    position: data.position ?? existing.position,
    updatedAt: new Date().toISOString(),
  };
  store.bikes[idx] = updated;
  writeStore(store);
  return updated;
}

export function deleteBike(id) {
  const store = readStore();
  store.bikes = store.bikes.filter((b) => b.id !== Number(id));
  writeStore(store);
}
