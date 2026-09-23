import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StatusBadge from "@/components/StatusBadge";
import BikeGallery from "@/components/BikeGallery";
import BikeCard from "@/components/BikeCard";
import { getBikeBySlug, listRelatedBikes } from "@/lib/bikes";
import { formatPrice, installmentText, CATEGORIES } from "@/lib/bike-constants";
import { bikeWhatsappLink } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function findPublicBike(slug) {
  const bike = getBikeBySlug(slug);
  // bikes "ocultas" não podem ser acessadas nem pelo link direto
  if (!bike || bike.status === "oculta") return null;
  return bike;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bike = findPublicBike(slug);
  if (!bike) return {};
  const cond = bike.condition === "seminova" ? "Seminova" : "Nova";
  return {
    title: `${bike.name} — ${cond} | SB Place`,
    description:
      bike.description?.slice(0, 155) ||
      `${bike.name}. ${formatPrice(bike.priceCents)} na SB Place, revenda autorizada Specialized em Tubarão, SC.`,
  };
}

export default async function BikeDetailPage({ params }) {
  const { slug } = await params;
  const bike = findPublicBike(slug);
  if (!bike) notFound();

  // Link completo desta página, enviado junto na mensagem do WhatsApp
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || (host?.startsWith("localhost") ? "http" : "https");
  const pageUrl = host ? `${proto}://${host}/bicicletas/${bike.slug}` : "";

  const categoryLabel =
    CATEGORIES.find((c) => c.value === bike.category)?.label || bike.category;
  const condition = bike.condition || "nova";
  const isUsed = condition === "seminova";
  const isSold = bike.status === "vendida";
  const showStatus = bike.status && bike.status !== "disponivel";
  const specs = bike.specs || [];
  const related = listRelatedBikes(bike, 3);
  const whatsappHref = bikeWhatsappLink(bike, pageUrl);

  const terms = isUsed
    ? [
        "Revisada antes de sair da loja",
        "Enviada para todo o Brasil, com frete grátis",
        "Fotos reais e ficha completa antes de fechar",
      ]
    : [
        "Nota fiscal e garantia Specialized",
        "Venda e retirada somente na loja, em Tubarão (não enviamos bikes novas)",
        "Sua bike usada pode entrar como parte do pagamento",
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bike.name,
    description: bike.description || bike.subtitle || bike.name,
    image: (bike.images || []).map((i) =>
      pageUrl ? new URL(`/uploads/${i}`, pageUrl).href : `/uploads/${i}`
    ),
    itemCondition: isUsed
      ? "https://schema.org/UsedCondition"
      : "https://schema.org/NewCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (bike.priceCents / 100).toFixed(2),
      availability: isSold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page py-6 md:py-8">
          <nav aria-label="Você está em" className="-my-2 flex flex-wrap items-center gap-x-2 text-sm text-stone">
            <Link href="/" className="inline-flex min-h-11 items-center transition hover:text-ink">Início</Link>
            <span aria-hidden>/</span>
            <Link
              href={isUsed ? "/catalogo?condicao=seminova" : "/catalogo?condicao=nova"}
              className="inline-flex min-h-11 items-center transition hover:text-ink"
            >
              {isUsed ? "Seminovas" : "Bikes novas"}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink">{bike.name}</span>
          </nav>
        </div>

        <section className="container-page grid gap-8 pb-28 md:grid-cols-2 md:gap-14 md:pb-20">
          <div className="md:sticky md:top-28 md:self-start">
            <BikeGallery images={bike.images} name={bike.name} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">
                {categoryLabel}
              </p>
              {isUsed && (
                <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
                  Seminova
                </span>
              )}
              {showStatus && <StatusBadge status={bike.status} />}
            </div>

            <h1 className="display mt-3 text-4xl text-ink md:text-5xl">{bike.name}</h1>
            {bike.subtitle && <p className="mt-3 text-lg text-stone">{bike.subtitle}</p>}

            <div className="mt-6 border-y border-hairline py-6">
              <p className="text-4xl font-semibold leading-none text-ink">
                {formatPrice(bike.priceCents)}
              </p>
              <p className="mt-2 text-base text-stone">
                {installmentText(bike)}
                {bike.cashPriceCents > 0 && (
                  <>
                    {" "}ou{" "}
                    <strong className="text-ink">{formatPrice(bike.cashPriceCents)}</strong>{" "}
                    à vista
                  </>
                )}
              </p>
            </div>

            <div className="mt-6 hidden md:block">
              <BuyButton href={whatsappHref} isSold={isSold} />
              {!isSold && (
                <p className="mt-3 text-sm text-stone">
                  Você fala direto com a equipe da SB Place pelo WhatsApp.
                </p>
              )}
            </div>

            <ul className="mt-8 flex flex-col gap-2.5 text-[15px] text-ink">
              {terms.map((t) => (
                <li key={t} className="flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-gold">
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>

            {bike.description && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-ink">Sobre esta bike</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-stone">
                  {bike.description}
                </p>
              </div>
            )}

            {specs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-ink">Ficha técnica</h2>
                <dl className="mt-3 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
                  {specs.map((s, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3 text-[15px] ${
                        i % 2 === 0 ? "bg-bone" : "bg-paper"
                      }`}
                    >
                      <dt className="text-stone">{s.label}</dt>
                      <dd className="font-medium text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-hairline bg-bone py-12 md:py-20">
            <div className="container-page">
              <h2 className="display text-3xl text-ink md:text-4xl">
                {isUsed ? "Outras seminovas" : "Outras bikes novas"}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {related.map((b) => (
                  <BikeCard key={b.id} bike={b} variant="bone" />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* No celular o botão de compra fica fixo no rodapé da tela */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper/95 p-3 backdrop-blur md:hidden">
        <BuyButton href={whatsappHref} isSold={isSold} full />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteFooter />
    </>
  );
}

function BuyButton({ href, isSold, full }) {
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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-8 font-semibold text-paper transition hover:bg-accent hover:text-ink md:h-[52px] ${
        full ? "w-full" : ""
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.1L2 22l5-1.6A9.9 9.9 0 1 0 12.04 2zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.2-2.9.9.9-2.8-.2-.3a8.1 8.1 0 0 1 6.7-12.6zm-3 4.1c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.4-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5-.1-.1-.6-1.5-.9-2-.2-.5-.4-.5-.6-.5z" />
      </svg>
      Tenho interesse — WhatsApp
    </a>
  );
}
