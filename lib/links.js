import crypto from "node:crypto";
import { readStore, writeStore } from "./db";
import { MAX_LINK_INSTALLMENTS, linkEffectiveStatus } from "./link-status";

export { linkEffectiveStatus } from "./link-status";

export function listLinks() {
  return [...readStore().links].sort((a, b) => b.id - a.id);
}

export function getLinkById(id) {
  return readStore().links.find((l) => l.id === Number(id)) || null;
}

export function getLinkByToken(token) {
  if (!token || typeof token !== "string") return null;
  return readStore().links.find((l) => l.token === token) || null;
}

export function createLink({
  description,
  amountCents,
  maxInstallments,
  customerName,
  customerPhone,
  requireAddress,
  expiresInDays,
}) {
  const store = readStore();
  const now = new Date();
  const days = Math.round(Number(expiresInDays) || 0);
  const link = {
    id: store.nextLinkId,
    token: crypto.randomBytes(16).toString("base64url"),
    description: String(description).trim().slice(0, 140),
    amountCents: Math.round(amountCents),
    maxInstallments: Math.min(
      MAX_LINK_INSTALLMENTS,
      Math.max(1, Math.round(Number(maxInstallments) || 1))
    ),
    customerName: String(customerName || "").trim().slice(0, 120),
    customerPhone: String(customerPhone || "").replace(/\D/g, "").slice(0, 13),
    requireAddress: Boolean(requireAddress),
    status: "ativo",
    expiresAt: days > 0 ? new Date(now.getTime() + days * 86400000).toISOString() : "",
    orderId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  store.nextLinkId += 1;
  store.links.push(link);
  writeStore(store);
  return link;
}

// Só link ativo (ou expirado) pode ser cancelado; link em uso ou pago tem
// pedido associado e se resolve pelo pedido.
export function cancelLink(id) {
  const store = readStore();
  const link = store.links.find((l) => l.id === Number(id));
  if (!link) return { error: "Link não encontrado." };
  if (link.status === "em_uso") {
    return { error: "Há um pagamento em andamento neste link. Resolva pelo pedido." };
  }
  if (link.status === "pago") return { error: "Este link já foi pago." };
  link.status = "cancelado";
  link.updatedAt = new Date().toISOString();
  writeStore(store);
  return { link };
}

export function effectiveLink(link) {
  return { ...link, effectiveStatus: linkEffectiveStatus(link) };
}
