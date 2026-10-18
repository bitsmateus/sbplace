import { notFound } from "next/navigation";
import { getCartaoBySlug, cartaoWhatsappLink } from "@/lib/cartoes-equipe";
import { siteConfig, fullAddress } from "@/lib/site-config";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Cartão de contato do consultor. A página existe só para quem recebe o link:
// não há link para ela em nenhum lugar do site e os buscadores não a indexam.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cartao = getCartaoBySlug(slug);
  if (!cartao) return { robots: { index: false, follow: false } };
  return {
    title: `${cartao.name} — ${cartao.role} | SB Place`,
    description: cartao.bio,
    robots: { index: false, follow: false },
  };
}

function IconeInstagram() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CDAA5E"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.1" cy="6.9" r="1.05" fill="#CDAA5E" stroke="none" />
    </svg>
  );
}

function Seta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-auto h-4 w-4 shrink-0 text-fog"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default async function CartaoConsultorPage({ params }) {
  const { slug } = await params;
  const cartao = getCartaoBySlug(slug);
  if (!cartao) notFound();

  const settings = getSettings();
  const endereco = fullAddress(settings.addressLine);

  const acoes = [
    {
      href: cartaoWhatsappLink(cartao),
      label: "WhatsApp direto",
      value: "Falar comigo agora",
      destaque: true,
    },
    {
      href: `https://instagram.com/${cartao.instagram}`,
      label: "Meu Instagram",
      value: `@${cartao.instagram}`,
    },
    {
      href: `https://instagram.com/${siteConfig.instagram}`,
      label: "Instagram da loja",
      value: `@${siteConfig.instagram}`,
    },
  ];

  return (
    <main className="flex min-h-screen flex-1 justify-center bg-ink px-5 py-8 text-paper">
      <div className="flex w-full max-w-[430px] flex-col">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-ink-soft">
          <span className="absolute left-4 top-4 z-10 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-paper backdrop-blur">
            SB Place Specialized
          </span>
          <img
            src={cartao.photo}
            alt={`${cartao.name}, ${cartao.role.toLowerCase()} da SB Place Specialized`}
            width={900}
            height={900}
            className="h-full w-full object-cover object-[50%_42%]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-b from-transparent via-ink/70 to-ink" />
        </div>

        <section className="relative z-10 -mt-9 flex flex-col items-center gap-3 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold">
            {cartao.role}
          </p>
          <h1 className="display text-4xl text-paper">{cartao.name}</h1>
          <p className="text-sm text-mist">
            SB Place <span className="text-paper">Specialized</span> ·{" "}
            {siteConfig.city}
          </p>
          <span className="h-px w-12 bg-gold/70" aria-hidden="true" />
          <p className="max-w-[32ch] text-[15px] font-light text-mist">
            {cartao.bio}
          </p>
        </section>

        <nav className="mt-7 flex flex-col gap-2.5" aria-label="Formas de contato">
          {acoes.map((acao) => (
            <a
              key={acao.label}
              href={acao.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex min-w-0 items-center gap-3.5 rounded-xl border bg-ink-soft px-4 py-3.5 transition hover:border-white/25 hover:bg-white/5 ${
                acao.destaque ? "border-[#2BB673]/30" : "border-line"
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                  acao.destaque
                    ? "border-[#2BB673]/30 bg-[#2BB673]/15"
                    : "border-line bg-white/5"
                }`}
                aria-hidden="true"
              >
                {acao.destaque ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2BB673"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.4-4.5A8.5 8.5 0 1 1 20.5 11.6Z" />
                    <path
                      d="M9 9.3c.2 2.7 2.9 5.4 5.6 5.6l1.1-1.3-1.9-1-1 .8c-1-.5-1.9-1.4-2.4-2.4l.8-1-1-1.9L9 9.3Z"
                      fill="#2BB673"
                      stroke="none"
                    />
                  </svg>
                ) : (
                  <IconeInstagram />
                )}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[10.5px] uppercase tracking-[0.2em] text-fog">
                  {acao.label}
                </span>
                <span className="break-words text-base font-medium text-paper">
                  {acao.value}
                </span>
              </span>
              <Seta />
            </a>
          ))}

          <a
            href={`tel:+${cartao.whatsapp}`}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-dashed border-line px-4 py-3.5 transition hover:border-white/25"
          >
            <span className="w-full text-[10.5px] uppercase tracking-[0.2em] text-fog">
              Telefone
            </span>
            <span className="text-[17px] font-medium tabular-nums text-paper">
              {cartao.whatsappDisplay}
            </span>
          </a>
        </nav>

        <footer className="mt-7 flex flex-col gap-1.5 border-t border-line pt-5 text-center text-[13px] font-light text-fog">
          <span className="text-sm font-semibold uppercase tracking-[0.22em] text-paper">
            SB Place Specialized
          </span>
          <span>{endereco}</span>
          <a
            href="https://sbplace.com.br"
            className="text-mist underline-offset-4 transition hover:text-gold hover:underline"
          >
            sbplace.com.br
          </a>
        </footer>
      </div>
    </main>
  );
}
