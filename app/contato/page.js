import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  siteConfig,
  whatsappLink,
  fullAddress,
  mapsEmbedUrl,
  mapsLinkUrl,
} from "@/lib/site-config";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contato | SB Place",
};

export default function ContatoPage() {
  const settings = getSettings();
  const hourLines = (settings.hours || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="container-page py-20 md:py-28">
          <h1 className="display text-5xl text-ink md:text-7xl">
            Contato
          </h1>
          <p className="mt-4 max-w-lg text-stone">
            Revenda autorizada Specialized em {siteConfig.city}. Fale com a gente
            pelo WhatsApp ou passe na loja. Bikes novas são vendidas somente na
            loja. Seminovas são enviadas para todo o Brasil, com frete grátis.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-bone p-8">
              <h2 className="text-xl font-semibold text-ink">
                WhatsApp
              </h2>
              <p className="mt-2 text-stone">
                Tire dúvidas, consulte disponibilidade e combine a retirada.
              </p>
              <a
                href={whatsappLink("Olá! Vim pelo site da SB Place.")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 font-semibold text-paper transition hover:bg-accent hover:text-ink"
              >
                Chamar no WhatsApp
              </a>
            </div>

            <div className="rounded-xl bg-bone p-8">
              <h2 className="text-xl font-semibold text-ink">
                Loja
              </h2>
              <p className="mt-2 text-stone">
                {fullAddress(settings.addressLine)}
              </p>
              <a
                href={`https://instagram.com/${siteConfig.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-12 items-center rounded-full border border-ink px-7 font-semibold text-ink transition hover:bg-ink hover:text-paper"
              >
                @{siteConfig.instagram}
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-bone p-8">
              <h2 className="text-xl font-semibold text-ink">
                Horário de funcionamento
              </h2>
              {hourLines.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm text-stone">
                  {hourLines.map((line, i) => (
                    <li key={i} className="border-b border-hairline pb-2">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-stone">Horário a confirmar.</p>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-hairline">
              <iframe
                title="Localização da SB Place"
                src={mapsEmbedUrl(settings.addressLine)}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "220px" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <a
            href={mapsLinkUrl(settings.addressLine)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center text-sm uppercase tracking-wide text-ink underline underline-offset-4 hover:text-accent-dark"
          >
            Ver no mapa →
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
