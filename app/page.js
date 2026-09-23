import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BikeCard from "@/components/BikeCard";
import BikePlaceholder from "@/components/BikePlaceholder";
import { listBikes } from "@/lib/bikes";
import {
  siteConfig,
  whatsappLink,
  fullAddress,
  mapsEmbedUrl,
  mapsLinkUrl,
} from "@/lib/site-config";
import { getSettings } from "@/lib/settings";
import {
  HistorySection,
  BikeFitSection,
  CafeSection,
  PodcastSection,
} from "@/components/HomeExtras";

export const dynamic = "force-dynamic";

const WHATSAPP_HELLO =
  "Olá! Vim pelo site da SB Place e queria saber mais sobre as bikes disponíveis.";

export default function HomePage() {
  const settings = getSettings();
  const novas = listBikes({ onlyPublic: true, condition: "nova" });
  const seminovas = listBikes({ onlyPublic: true, condition: "seminova" });

  // Foto de fundo do hero: a bike em destaque (ou a primeira com foto).
  const heroBike = [...novas, ...seminovas].find((b) => b.images?.length > 0);

  const tiles = [
    {
      title: "Mountain bike",
      sub: "Epic, Chisel, Stumpjumper e Rockhopper",
      href: "/catalogo?categoria=mtb",
      cover: coverOf({ category: "mtb" }),
    },
    {
      title: "Speed",
      sub: "Tarmac, Roubaix e Allez",
      href: "/catalogo?categoria=speed",
      cover: coverOf({ category: "speed" }),
    },
    {
      title: "E-bikes",
      sub: "Turbo Levo, Turbo Tero e Turbo Creo",
      href: "/catalogo?categoria=eletrica",
      cover: coverOf({ category: "eletrica" }),
    },
    {
      title: "Seminovas",
      sub: "Revisadas, com frete grátis para todo o Brasil",
      href: "/catalogo?condicao=seminova",
      cover: coverOf({ condition: "seminova" }),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero cover={heroBike?.images?.[0]} />
        <HistorySection />
        <TypesSection tiles={tiles} />
        <NewBikesSection bikes={novas.slice(0, 4)} />
        <BikeFitSection />
        <UsedBikesSection bikes={seminovas.slice(0, 3)} />
        <CafeSection />
        <PodcastSection />
        <InstagramBand />
        <StoreSection
          hours={settings.hours}
          addressLine={settings.addressLine}
        />
      </main>
      <SiteFooter />
    </>
  );
}

function coverOf(filter) {
  const bike = listBikes({ onlyPublic: true, ...filter }).find(
    (b) => b.images?.length > 0
  );
  return bike?.images?.[0] || null;
}

function SectionHead({ title, children, tone = "light" }) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-10">
      <h2
        className={`display text-4xl md:text-5xl lg:text-6xl ${
          tone === "dark" ? "text-paper" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Hero({ cover }) {
  return (
    <section className="relative flex min-h-[600px] items-end overflow-hidden bg-ink text-paper md:min-h-[720px]">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/uploads/${cover}`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-[#1c1c1c] via-ink to-ink"
          />
          <BikePlaceholder className="absolute -right-10 top-1/2 hidden w-[60%] -translate-y-1/2 text-paper/[0.06] md:block" />
        </>
      )}
      {/* escurece a foto para o texto ficar legível */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10"
      />

      <div className="container-page relative">
        <div className="flex flex-col gap-6 pb-10 pt-32 md:gap-8 md:pb-20 md:pt-40">
          <h1 className="display text-5xl sm:text-7xl lg:text-[7.5rem]">
            Sua próxima
            <br />
            Specialized.
          </h1>
          <p className="max-w-2xl text-base text-[#D6D3CC] md:text-xl">
            Revenda autorizada Specialized em Tubarão, SC. Bikes novas com nota
            fiscal e garantia Specialized, vendidas na loja em Tubarão. Seminovas
            de alto padrão revisadas e enviadas para todo o Brasil.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href={whatsappLink(WHATSAPP_HELLO)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-paper px-7 text-base font-semibold text-ink transition hover:bg-gold md:h-[52px]"
            >
              Falar no WhatsApp
            </a>
            <Link
              href="/catalogo?condicao=seminova"
              className="inline-flex h-12 items-center justify-center rounded-full border border-paper px-7 text-base font-semibold text-paper transition hover:bg-paper hover:text-ink md:h-[52px]"
            >
              Ver seminovas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TypesSection({ tiles }) {
  return (
    <section id="bikes" className="py-12 md:py-24">
      <div className="container-page">
        <SectionHead title="Escolha por tipo">
          <a
            href={`https://instagram.com/${siteConfig.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 pb-1 font-semibold underline decoration-gold decoration-2 underline-offset-[6px] transition hover:text-accent-dark"
          >
            Todas as bikes disponíveis estão no Instagram
          </a>
        </SectionHead>

        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative block h-[220px] overflow-hidden rounded-xl bg-ink text-paper md:h-[440px]"
            >
              {tile.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/uploads/${tile.cover}`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <BikePlaceholder className="absolute inset-x-0 top-8 mx-auto w-4/5 text-paper/10 transition group-hover:text-gold/30" />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
              />
              <div className="absolute inset-x-4 bottom-4 md:inset-x-7 md:bottom-7">
                <p className="text-[22px] font-semibold leading-tight md:text-3xl">
                  {tile.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-mist md:text-base">
                  {tile.sub}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewBikesSection({ bikes }) {
  return (
    <section className="bg-bone py-12 md:py-24">
      <div className="container-page">
        <SectionHead title="Novas em destaque">
          <p className="max-w-lg text-base text-stone md:text-[17px]">
            Preço tabelado Specialized, em até 12x sem juros no cartão. Venda e
            retirada somente na loja, em Tubarão.
          </p>
        </SectionHead>

        {bikes.length === 0 ? (
          <EmptyState
            text="As bikes novas em estoque aparecem aqui. Enquanto isso, consulte a disponibilidade pelo WhatsApp."
            tone="light"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {bikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} variant="bone" />
            ))}
          </div>
        )}

        <div className="mt-8 md:mt-10">
          <Link
            href="/catalogo?condicao=nova"
            className="inline-flex h-12 w-full items-center justify-center rounded-full border border-ink px-7 font-semibold text-ink transition hover:bg-ink hover:text-paper sm:w-auto md:h-[52px]"
          >
            Ver todas as novas
          </Link>
        </div>
      </div>
    </section>
  );
}

function UsedBikesSection({ bikes }) {
  return (
    <section id="seminovas" className="bg-ink py-12 text-paper md:py-24">
      <div className="container-page">
        <SectionHead title="Seminovas de alto padrão" tone="dark">
          <p className="max-w-lg text-base text-mist md:text-[17px]">
            Revisadas, com fotos reais e ficha completa de cada bike. Enviamos
            para todo o Brasil com frete grátis, em até 21x sem juros no cartão.
          </p>
        </SectionHead>

        {bikes.length === 0 ? (
          <EmptyState
            text="Nenhuma seminova cadastrada no momento. Pergunte pelo WhatsApp ou confira as novidades no Instagram."
            tone="dark"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {bikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} variant="dark" />
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 md:mt-10">
          <Link
            href="/catalogo?condicao=seminova"
            className="inline-flex h-12 items-center justify-center rounded-full border border-paper px-7 font-semibold text-paper transition hover:bg-paper hover:text-ink md:h-[52px]"
          >
            Ver todas as seminovas
          </Link>
          <a
            href={whatsappLink(
              "Olá! Gostaria de saber mais sobre as bikes seminovas."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-7 font-semibold text-ink transition hover:bg-paper md:h-[52px]"
          >
            Perguntar sobre uma seminova
          </a>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ text, tone }) {
  return (
    <p
      className={`max-w-xl rounded-xl border border-dashed p-6 text-base ${
        tone === "dark"
          ? "border-line text-mist"
          : "border-stone/30 text-stone"
      }`}
    >
      {text}
    </p>
  );
}

function InstagramBand() {
  return (
    <section className="bg-gold text-ink">
      <div className="container-page flex flex-col gap-5 py-10 md:flex-row md:items-center md:justify-between md:py-14">
        <div>
          <p className="display text-4xl md:text-5xl">@{siteConfig.instagram}</p>
          <p className="mt-2 text-base md:text-lg">
            Fotos e ficha completa de todas as bikes disponíveis na loja.
          </p>
        </div>
        <a
          href={`https://instagram.com/${siteConfig.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 font-semibold text-paper transition hover:bg-paper hover:text-ink md:h-[52px]"
        >
          Seguir no Instagram
        </a>
      </div>
    </section>
  );
}

function StoreSection({ hours, addressLine }) {
  const hourLines = (hours || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section id="loja" className="py-12 md:py-24">
      <div className="container-page grid gap-10 md:grid-cols-2 md:gap-20">
        <div className="flex flex-col gap-5">
          <h2 className="display text-4xl text-ink md:text-5xl lg:text-6xl">
            A loja
          </h2>
          <p className="text-base text-stone md:text-lg">
            Revenda autorizada Specialized em Tubarão, Santa Catarina. Venha
            conhecer as bikes de perto, comparar tamanhos e tirar dúvidas com a
            equipe.
          </p>
          <div>
            <strong className="block text-lg font-semibold text-ink">
              {fullAddress(addressLine)}
            </strong>
            {hourLines.length > 0 && (
              <ul className="mt-3 divide-y divide-hairline border-y border-hairline text-sm text-stone">
                {hourLines.map((line, i) => (
                  <li key={i} className="py-2.5">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <a
            href={mapsLinkUrl(addressLine)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit font-semibold text-ink underline decoration-gold decoration-2 underline-offset-[6px] transition hover:text-accent-dark"
          >
            Ver no mapa →
          </a>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[15px] text-stone">WhatsApp</span>
            <a
              href={whatsappLink(WHATSAPP_HELLO)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl font-semibold leading-tight text-ink transition hover:text-accent-dark md:text-[32px]"
            >
              {siteConfig.phoneDisplay}
            </a>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[15px] text-stone">Instagram</span>
            <a
              href={`https://instagram.com/${siteConfig.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl font-semibold leading-tight text-ink transition hover:text-accent-dark md:text-[32px]"
            >
              @{siteConfig.instagram}
            </a>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-bone">
            <iframe
              title="Localização da SB Place"
              src={mapsEmbedUrl(addressLine)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
