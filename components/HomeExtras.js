import VideoPlayer from "./VideoPlayer";
import LocalVideo from "./LocalVideo";
import { whatsappLink } from "@/lib/site-config";
import {
  PODCAST_EPISODES,
  YOUTUBE_CHANNEL,
  CAFE,
  HISTORY_VIDEO,
  BIKEFIT_VIDEO,
} from "@/lib/site-content";

function Eyebrow({ children, tone = "light" }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.22em] ${
        tone === "dark" ? "text-gold" : "text-stone"
      }`}
    >
      {children}
    </p>
  );
}

function Check({ className = "" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`mt-0.5 shrink-0 ${className}`}
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function HistorySection() {
  return (
    <section id="historia" className="scroll-mt-24 py-14 md:py-28">
      <div className="container-page">
        <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-4 text-center md:mb-12">
          <Eyebrow>Nossa história</Eyebrow>
          <h2 className="display text-4xl text-ink md:text-5xl lg:text-6xl">
            Onde tudo começou.
          </h2>
          <p className="text-base text-stone md:text-lg">
            Conheça a história da SB Place e como chegamos até aqui.
          </p>
        </div>
        <div className="mx-auto max-w-5xl">
          <VideoPlayer
            videoId={HISTORY_VIDEO.videoId}
            title={HISTORY_VIDEO.title}
            duration={HISTORY_VIDEO.duration}
            cover={HISTORY_VIDEO.cover}
          />
        </div>
      </div>
    </section>
  );
}

export function BikeFitSection() {
  const benefits = [
    "Mais conforto nos pedais longos",
    "Melhor aproveitamento da pedalada",
    "Menos dor nas costas, joelhos e mãos",
  ];

  return (
    <section id="bikefit" className="py-14 md:py-28">
      <div className="container-page grid items-center gap-10 md:grid-cols-[minmax(0,380px)_1fr] md:gap-20">
        <div className="order-last mx-auto w-full max-w-[340px] md:order-first md:mx-0 md:max-w-none">
          <LocalVideo
            src={BIKEFIT_VIDEO.src}
            poster={BIKEFIT_VIDEO.poster}
            title={BIKEFIT_VIDEO.title}
            duration={BIKEFIT_VIDEO.duration}
          />
        </div>

        <div className="flex flex-col items-start gap-5 md:gap-6">
          <Eyebrow>Bike fit</Eyebrow>
          <h2 className="display text-4xl text-ink md:text-5xl lg:text-6xl">
            Sua bike ajustada ao seu corpo.
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-stone md:text-lg">
            O bike fit adapta a bicicleta às suas medidas e ao seu jeito de
            pedalar. É feito aqui, na SB Place, para você render mais e pedalar
            sem dor.
          </p>
          <ul className="flex flex-col gap-3 text-base text-ink">
            {benefits.map((b) => (
              <li key={b} className="flex gap-3">
                <Check className="text-gold" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <a
            href={whatsappLink("Olá! Quero saber mais sobre o bike fit da SB Place.")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-8 text-[15px] font-semibold text-paper transition hover:bg-gold hover:text-ink sm:w-auto md:h-[52px]"
          >
            Agendar bike fit
          </a>
        </div>
      </div>
    </section>
  );
}

export function CafeSection() {
  return (
    <section id="cafe" className="bg-bone py-14 md:py-28">
      <div className="container-page grid items-center gap-10 md:grid-cols-2 md:gap-20">
        <div className="flex flex-col items-start gap-5 md:gap-6">
          <Eyebrow>Dentro da loja</Eyebrow>
          <h2 className="display text-4xl text-ink md:text-5xl lg:text-6xl">
            Não é só uma loja de bicicletas.
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-stone md:text-lg">
            A <strong className="font-semibold text-ink">{CAFE.name}</strong>{" "}
            funciona anexa à SB Place. Tome um bom café com os amigos enquanto
            a equipe faz um ajuste na sua bike, e aproveite para marcar o pedal
            do fim de semana.
          </p>
          <a
            href={`https://instagram.com/${CAFE.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full border border-ink px-8 text-[15px] font-semibold text-ink transition hover:bg-ink hover:text-paper sm:w-auto md:h-[52px]"
          >
            @{CAFE.instagram}
          </a>
        </div>

        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-ink">
          <div
            aria-hidden
            className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
          />
          <svg
            viewBox="0 0 120 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="relative w-1/3 text-gold"
          >
            <path d="M22 44h62v26a22 22 0 0 1-22 22H44a22 22 0 0 1-22-22V44z" />
            <path d="M84 52h8a10 10 0 0 1 0 20h-8" />
            <path d="M40 30c0-6 6-6 6-12M56 30c0-6 6-6 6-12M72 30c0-6 6-6 6-12" />
          </svg>
        </div>
      </div>
    </section>
  );
}

function PlayBadge() {
  return (
    <span
      aria-hidden
      className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper/90 text-ink opacity-90 transition group-hover:scale-110 group-hover:bg-paper"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
      </svg>
    </span>
  );
}

function episodeLabel(ep) {
  return `Episódio ${String(ep.number).padStart(2, "0")}`;
}

export function PodcastSection() {
  const [latest, ...others] = PODCAST_EPISODES;
  const href = (ep) => `https://www.youtube.com/watch?v=${ep.videoId}`;

  return (
    <section id="podcast" className="bg-ink py-14 text-paper md:py-28">
      <div className="container-page">
        <div className="mb-8 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <Eyebrow tone="dark">Podcast</Eyebrow>
            <h2 className="display text-4xl md:text-5xl lg:text-6xl">
              SB Place Podcast
            </h2>
            <p className="max-w-lg text-base text-mist md:text-lg">
              Conversas com empresários e ciclistas, gravadas na SB Place.
            </p>
          </div>
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full border border-paper/40 px-7 text-[15px] font-semibold transition hover:border-paper hover:bg-paper hover:text-ink"
          >
            Ver canal no YouTube
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
          <a
            href={href(latest)}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="relative aspect-video overflow-hidden rounded-xl bg-ink-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={latest.cover}
                alt={`${episodeLabel(latest)}: ${latest.guest}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <PlayBadge />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Mais recente · {episodeLabel(latest)} · {latest.duration}
            </p>
            <h3 className="mt-1 text-xl font-semibold md:text-2xl">
              {latest.guest}
            </h3>
            {latest.role && <p className="text-mist">{latest.role}</p>}
          </a>

          <ul className="flex flex-col gap-5">
            {others.map((ep) => (
              <li key={ep.videoId}>
                <a
                  href={href(ep)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4"
                >
                  <div className="relative aspect-video w-[42%] shrink-0 overflow-hidden rounded-xl bg-ink-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ep.cover}
                      alt={`${episodeLabel(ep)}: ${ep.guest}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 self-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                      {episodeLabel(ep)} · {ep.duration}
                    </p>
                    <h3 className="mt-1 text-base font-semibold leading-snug md:text-lg">
                      {ep.guest}
                    </h3>
                    {ep.role && (
                      <p className="mt-0.5 text-sm text-mist">{ep.role}</p>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const nova = [
    "Venda e retirada somente na loja, em Tubarão",
    "Nota fiscal e garantia Specialized",
    "Até 12x sem juros no cartão, com desconto à vista",
    "Sua bike usada pode entrar como parte do pagamento",
  ];
  const seminova = [
    "Revisada antes de sair da loja",
    "Enviada para todo o Brasil, com frete grátis",
    "Até 21x sem juros no cartão, com desconto à vista",
    "Fotos reais e ficha completa antes de fechar",
  ];

  return (
    <section className="py-12 md:py-24">
      <div className="container-page">
        <h2 className="display text-4xl text-ink md:text-5xl lg:text-6xl">
          Nova ou seminova: como funciona
        </h2>
        <div className="mt-8 grid gap-8 md:mt-12 md:grid-cols-2 md:gap-0">
          {[
            { title: "Bike nova", items: nova },
            { title: "Bike seminova", items: seminova },
          ].map((col, i) => (
            <div
              key={col.title}
              className={`flex flex-col gap-5 ${
                i === 0
                  ? "md:pr-16"
                  : "border-t border-hairline pt-8 md:border-l md:border-t-0 md:pl-16 md:pt-0"
              }`}
            >
              <h3 className="text-2xl font-semibold text-ink md:text-3xl">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3.5 text-base text-[#1A1A1A] md:text-lg">
                {col.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="text-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TradeInSection() {
  const items = [
    "Fotos da bike",
    "Marca, modelo e tamanho do quadro",
    "Ano e grupo de marchas",
    "Suspensão e freios",
    "Upgrades feitos",
    "Nota fiscal, se tiver",
  ];

  return (
    <section id="troca" className="bg-bone py-12 md:py-24">
      <div className="container-page grid gap-10 md:grid-cols-2 md:gap-20">
        <div className="flex flex-col items-start gap-5 md:gap-6">
          <h2 className="display text-4xl text-ink md:text-5xl lg:text-6xl">
            Sua bike usada entra como parte do pagamento.
          </h2>
          <p className="text-base text-stone md:text-lg">
            Escolheu uma bike nova ou seminova? Mande os dados da sua bike atual
            pelo WhatsApp e a equipe faz a avaliação.
          </p>
          <a
            href={whatsappLink(
              "Olá! Quero uma avaliação da minha bike usada para entrar como parte do pagamento."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-7 font-semibold text-paper transition hover:bg-accent hover:text-ink sm:w-auto md:h-[52px]"
          >
            Pedir avaliação
          </a>
        </div>

        <div className="flex flex-col gap-4 md:pt-2">
          <strong className="text-lg font-semibold text-ink">
            O que mandar pelo WhatsApp
          </strong>
          <ul className="flex flex-col gap-3 text-base text-stone md:text-[17px]">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="text-ink" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

