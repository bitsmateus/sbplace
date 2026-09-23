import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import StatusBadge from "@/components/StatusBadge";
import BikeGallery from "@/components/BikeGallery";
import { getBikeBySlug } from "@/lib/bikes";
import { formatPrice, installmentText, CATEGORIES } from "@/lib/bike-constants";
import { whatsappLink } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bike = getBikeBySlug(slug);
  if (!bike) return {};
  return {
    title: `${bike.name} | SB Place`,
    description: bike.description?.slice(0, 150),
  };
}

export default async function BikeDetailPage({ params }) {
  const { slug } = await params;
  const bike = getBikeBySlug(slug);

  if (!bike) notFound();

  const categoryLabel =
    CATEGORIES.find((c) => c.value === bike.category)?.label || bike.category;

  const condition = bike.condition || "nova";
  const isUsed = condition === "seminova";
  const isSold = bike.status === "vendida";
  const showStatus = bike.status && bike.status !== "disponivel";

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

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page py-6 md:py-8">
          <Link
            href={isUsed ? "/catalogo?condicao=seminova" : "/catalogo"}
            className="text-sm font-semibold text-stone transition hover:text-ink"
          >
            ← Voltar ao catálogo
          </Link>
        </div>

        <section className="container-page grid gap-8 pb-28 md:grid-cols-2 md:gap-14 md:pb-28">
          <BikeGallery images={bike.images} name={bike.name} />

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

            <h1 className="display mt-3 text-4xl text-ink md:text-6xl">
              {bike.name}
            </h1>
            {bike.subtitle && (
              <p className="mt-3 text-lg text-stone">{bike.subtitle}</p>
            )}

            <div className="mt-6 border-y border-hairline py-6">
              <p className="text-4xl font-semibold leading-none text-ink">
                {formatPrice(bike.priceCents)}
              </p>
              <p className="mt-2 text-base text-stone">
                {installmentText(bike)}
                {bike.cashPriceCents > 0 && (
                  <>
                    {" "}
                    ou{" "}
                    <strong className="text-ink">
                      {formatPrice(bike.cashPriceCents)}
                    </strong>{" "}
                    à vista
                  </>
                )}
              </p>
            </div>

            {bike.description && (
              <p className="mt-6 whitespace-pre-line leading-relaxed text-stone">
                {bike.description}
              </p>
            )}

            <ul className="mt-6 flex flex-col gap-2.5 text-[15px] text-ink">
              {terms.map((t) => (
                <li key={t} className="flex gap-3">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-gold"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7" />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden md:block">
              <BuyButton bike={bike} isSold={isSold} />
            </div>
          </div>
        </section>
      </main>

      {/* No celular o botão fica fixo no rodapé da tela */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-paper/95 p-3 backdrop-blur md:hidden">
        <BuyButton bike={bike} isSold={isSold} full />
      </div>

      <SiteFooter />
    </>
  );
}

function BuyButton({ bike, isSold, full }) {
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
      href={whatsappLink(
        `Olá! Tenho interesse na ${bike.name} (${formatPrice(
          bike.priceCents
        )}) que vi no site da SB Place.`
      )}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 font-semibold text-paper transition hover:bg-accent hover:text-ink md:h-[52px] ${
        full ? "w-full" : ""
      }`}
    >
      Tenho interesse — WhatsApp
    </a>
  );
}
