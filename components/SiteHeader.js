import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { whatsappLink } from "@/lib/site-config";

export const NAV_LINKS = [
  { href: "/catalogo?condicao=nova", label: "Bikes novas" },
  { href: "/catalogo?condicao=seminova", label: "Seminovas" },
  { href: "/#bikefit", label: "Bike fit" },
  { href: "/#cafe", label: "Café" },
  { href: "/#podcast", label: "Podcast" },
  { href: "/#loja", label: "A loja" },
];

const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da SB Place e gostaria de falar sobre bicicletas.";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ink text-paper">
      <p className="flex min-h-10 items-center justify-center border-b border-line px-4 py-2 text-center text-[13px] font-medium text-mist md:text-sm">
        Seminovas com frete grátis para todo o Brasil e parcelamento em até 21x
        sem juros no cartão.
      </p>

      <div className="relative border-b border-line">
        <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
          <Link href="/" className="shrink-0" aria-label="SB Place — início">
            <Logo className="h-11 md:h-14" />
          </Link>

          <nav
            aria-label="Principal"
            className="hidden items-center gap-7 text-[15px] font-medium lg:gap-9 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink(WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full bg-paper px-4 text-sm font-semibold text-ink transition hover:bg-gold md:h-11 md:px-6 md:text-[15px]"
            >
              Falar no WhatsApp
            </a>
            <MobileMenu links={NAV_LINKS} />
          </div>
        </div>
      </div>
    </header>
  );
}
