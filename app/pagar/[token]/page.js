import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CheckoutForm from "@/components/CheckoutForm";
import { getLinkByToken, linkEffectiveStatus } from "@/lib/links";
import { formatPrice } from "@/lib/bike-constants";
import { isRedeConfigured } from "@/lib/rede";
import { whatsappLink } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pagamento | SB Place",
  robots: { index: false },
};

const UNAVAILABLE = {
  em_uso: "Já existe um pagamento em andamento neste link. Se foi você, aguarde a confirmação; se não, fale com a gente.",
  pago: "Este link já foi pago. Obrigado!",
  expirado: "Este link de pagamento expirou. Peça um novo para a equipe da SB Place.",
  cancelado: "Este link de pagamento foi cancelado. Peça um novo para a equipe da SB Place.",
};

export default async function PagarPage({ params }) {
  const { token } = await params;
  const link = getLinkByToken(token);
  if (!link) notFound();

  const status = linkEffectiveStatus(link);
  const online = isRedeConfigured();
  const available = status === "ativo" && online;
  const help = whatsappLink(`Olá! Preciso de ajuda com o link de pagamento: ${link.description}`);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container-page max-w-3xl py-8 md:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Pagamento</p>
          <h1 className="display mt-2 text-4xl text-ink md:text-5xl">Finalizar pagamento</h1>

          <div className="mt-6 rounded-2xl border border-hairline bg-bone p-5">
            <p className="font-semibold text-ink">{link.description}</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{formatPrice(link.amountCents)}</p>
            {link.maxInstallments > 1 && (
              <p className="mt-1 text-sm text-stone">Em até {link.maxInstallments}x sem juros no cartão de crédito.</p>
            )}
          </div>

          {available ? (
            <div className="mt-10 pb-16">
              <CheckoutForm
                endpoint={`/api/pagar/${link.token}`}
                requireAddress={link.requireAddress}
                priceCents={link.amountCents}
                maxInstallments={link.maxInstallments}
                prefill={{ name: link.customerName, phone: link.customerPhone }}
              />
            </div>
          ) : (
            <div className="mt-8 pb-16">
              <p className="rounded-xl border border-hairline p-5 text-[15px] text-ink">
                {status !== "ativo"
                  ? UNAVAILABLE[status] || "Este link não está disponível."
                  : "O pagamento online está indisponível no momento. Fale com a gente pelo WhatsApp."}
              </p>
              <a
                href={help}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 font-semibold text-paper transition hover:bg-accent hover:text-ink"
              >
                Falar com a equipe no WhatsApp
              </a>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
