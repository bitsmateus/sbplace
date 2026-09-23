import Link from "next/link";
import Logo from "./Logo";
import { siteConfig, fullAddress, mapsLinkUrl } from "@/lib/site-config";
import { getSettings } from "@/lib/settings";

export default function SiteFooter() {
  const settings = getSettings();
  const hourLines = (settings.hours || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <footer className="bg-ink text-paper">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Logo className="h-16" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
            {siteConfig.tagline}. Bikes novas vendidas somente na loja, em
            Tubarão. Seminovas revisadas enviadas para todo o Brasil.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Navegação
          </h3>
          <ul className="mt-3 text-sm text-mist">
            <li>
              <Link
                href="/catalogo?condicao=nova"
                className="inline-flex min-h-11 items-center transition hover:text-paper"
              >
                Bikes novas
              </Link>
            </li>
            <li>
              <Link
                href="/catalogo?condicao=seminova"
                className="inline-flex min-h-11 items-center transition hover:text-paper"
              >
                Seminovas
              </Link>
            </li>
            <li>
              <Link href="/catalogo" className="inline-flex min-h-11 items-center transition hover:text-paper">
                Catálogo completo
              </Link>
            </li>
            <li>
              <Link href="/contato" className="inline-flex min-h-11 items-center transition hover:text-paper">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Contato
          </h3>
          <ul className="mt-3 text-sm text-mist">
            <li>
              <a
                href={mapsLinkUrl(settings.addressLine)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center transition hover:text-paper"
              >
                {fullAddress(settings.addressLine)}
              </a>
            </li>
            <li>
              <a
                href={`https://instagram.com/${siteConfig.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center transition hover:text-paper"
              >
                @{siteConfig.instagram}
              </a>
            </li>
          </ul>

          {hourLines.length > 0 && (
            <ul className="mt-6 space-y-1 text-xs text-fog">
              {hourLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-line py-6">
        <div className="container-page flex flex-col gap-1 text-xs text-fog md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Revenda autorizada
            Specialized em Tubarão, SC.
          </p>
          {(settings.legalName || settings.cnpj) && (
            <p>
              {[settings.legalName, settings.cnpj && `CNPJ ${settings.cnpj}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
