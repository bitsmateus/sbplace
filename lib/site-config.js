export const siteConfig = {
  name: "SB Place",
  tagline: "Revenda autorizada Specialized em Tubarão, SC",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5548991574419",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "sbplaceoficial",
  address:
    process.env.NEXT_PUBLIC_ADDRESS || "Tubarão / SC — endereço a confirmar",
  phoneDisplay: "(48) 9 9157-4419",
  city: "Tubarão, SC",
};

export function whatsappLink(message) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}

// Builds the full postal address for display, preferring the street line
// the shop owner set in the admin panel and falling back to the generic
// default configured via env vars.
export function fullAddress(addressLine) {
  if (addressLine && addressLine.trim()) {
    return `${addressLine.trim()} — Tubarão / SC`;
  }
  return siteConfig.address;
}

// Google Maps embed URL that works without an API key.
export function mapsEmbedUrl(addressLine) {
  const query = addressLine && addressLine.trim() ? addressLine.trim() + ", Tubarão, SC" : "Tubarão, SC";
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function mapsLinkUrl(addressLine) {
  const query = addressLine && addressLine.trim() ? addressLine.trim() + ", Tubarão, SC" : "Tubarão, SC";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Mensagem do botão de compra da página da bike.
export function bikeWhatsappLink(bike, pageUrl) {
  const lines = [
    `Olá! Vim pelo site da SB Place e tenho interesse na bike ${bike.name}.`,
  ];
  if (pageUrl) lines.push(pageUrl);
  return whatsappLink(lines.join("\n"));
}
