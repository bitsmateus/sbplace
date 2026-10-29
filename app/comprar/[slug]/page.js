import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CheckoutForm from "@/components/CheckoutForm";
import RevisaoBadge from "@/components/RevisaoBadge";
import { getBikeBySlug } from "@/lib/bikes";
import { formatPrice, installmentInfo, isInReview } from "@/lib/bike-constants";
import { MAX_ONLINE_INSTALLMENTS } from "@/lib/order-constants";
import { isRedeConfigured } from "@/lib/rede";
import { uploadUrl } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finalizar compra | SB Place",
  robots: { index: false },
};

export default async function ComprarPage({ params }) {
  const { slug } = await params;
  const bike = getBikeBySlug(slug);
  if (!bike || bike.status === "oculta") notFound();

  // Só seminovas disponíveis são vendidas online (bikes novas: somente na loja)
  const canBuyOnline =
    isRedeConfigured() && (bike.condition || "nova") === "seminova" && bike.status === "disponivel" && bike.priceCents > 0;
  if (!canBuyOnline) redirect(`/bicicletas/${bike.slug}`);

  const maxInstallments = Math.min(installmentInfo(bike).count, MAX_ONLINE_INSTALLMENTS);
  const image = (bike.images || [])[0];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page py-6 md:py-10">
          <Link
            href={`/bicicletas/${bike.slug}`}
            className="inline-flex min-h-11 items-center text-sm text-stone transition hover:text-ink"
          >
            ← Voltar para a bike
          </Link>
          <h1 className="display mt-2 text-4xl text-ink md:text-5xl">Finalizar compra</h1>

          <div className="mt-8 grid gap-10 pb-16 lg:grid-cols-[1fr_380px] lg:gap-16">
            <CheckoutForm slug={bike.slug} priceCents={bike.priceCents} maxInstallments={maxInstallments} />

            <aside className="order-first lg:order-last lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-hairline bg-bone p-5">
                <div className="flex gap-4">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={uploadUrl(image, 320)} alt="" className="h-24 w-24 shrink-0 rounded-xl bg-paper object-cover" />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
                        Seminova
                      </span>
                      {isInReview(bike) && <RevisaoBadge />}
                    </div>
                    <p className="mt-2 font-semibold text-ink">{bike.name}</p>
                  </div>
                </div>
                <dl className="mt-5 space-y-2 border-t border-hairline pt-4 text-[15px]">
                  <div className="flex justify-between">
                    <dt className="text-stone">Bike</dt>
                    <dd className="font-medium text-ink">{formatPrice(bike.priceCents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-stone">Frete</dt>
                    <dd className="font-medium text-ink">Grátis</dd>
                  </div>
                  <div className="flex justify-between border-t border-hairline pt-3 text-lg">
                    <dt className="font-semibold text-ink">Total</dt>
                    <dd className="font-semibold text-ink">{formatPrice(bike.priceCents)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-stone">
                  Revisada antes de sair da loja e enviada para todo o Brasil.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
