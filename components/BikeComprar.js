"use client";

// Botão "Tenho interesse — WhatsApp" da página da bike. É um Client Component
// para poder mandar na mensagem a cor que o cliente escolheu nas bolinhas.
import { useCorDaBike } from "./CorDaBike";
import { bikeWhatsappLink } from "@/lib/site-config";
import { nomeDaCor } from "@/lib/cores-specialized";

export default function BikeComprar({ bikeName, pageUrl, isSold, full, checkoutHref }) {
  const { cor } = useCorDaBike();

  if (isSold) {
    return (
      <span
        className={`inline-flex h-12 items-center justify-center rounded-full border border-hairline px-7 font-semibold text-stone ${
          full ? "w-full" : ""
        }`}
      >
        Bicicleta vendida
      </span>
    );
  }

  const href = bikeWhatsappLink(
    { name: bikeName },
    pageUrl,
    cor ? nomeDaCor(cor.nome) : ""
  );

  // Seminova com pagamento online ligado: "Comprar agora" é o botão principal
  // e o WhatsApp vira a alternativa.
  const wppClass = checkoutHref
    ? `inline-flex h-12 items-center justify-center gap-2 rounded-full border border-hairline px-6 font-semibold text-ink transition hover:border-ink md:h-[52px] ${full ? "flex-1" : ""}`
    : `inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-8 font-semibold text-paper transition hover:bg-accent hover:text-ink md:h-[52px] ${full ? "w-full" : ""}`;

  const whatsapp = (
    <a
      href={href}
      data-ref="comprar"
      target="_blank"
      rel="noopener noreferrer"
      className={wppClass}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5-1.6A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.2-2.9.9.9-2.8-.2-.3a8.1 8.1 0 0 1 6.7-12.6zm-3 4.1c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.5-.9-2-.2-.5-.4-.5-.6-.5z" />
      </svg>
      {checkoutHref ? "WhatsApp" : "Tenho interesse — WhatsApp"}
    </a>
  );

  if (!checkoutHref) return whatsapp;

  return (
    <div className={`flex gap-2 ${full ? "" : "flex-wrap"}`}>
      <a
        href={checkoutHref}
        className={`inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 font-semibold text-paper transition hover:bg-accent hover:text-ink md:h-[52px] ${
          full ? "flex-[2]" : ""
        }`}
      >
        Comprar agora
      </a>
      {whatsapp}
    </div>
  );
}
