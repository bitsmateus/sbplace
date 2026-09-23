import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BikeCard from "@/components/BikeCard";
import { listBikes, CATEGORIES } from "@/lib/bikes";
import { CONDITIONS } from "@/lib/bike-constants";
import { HowItWorksSection, TradeInSection } from "@/components/HomeExtras";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo | SB Place",
};

const HEADINGS = {
  nova: {
    title: "Bikes novas",
    text: "Preço tabelado Specialized, nota fiscal e garantia. Em até 12x sem juros no cartão. Venda e retirada somente na loja, em Tubarão.",
  },
  seminova: {
    title: "Seminovas",
    text: "Seminovas de alto padrão, revisadas, com fotos reais. Frete grátis para todo o Brasil e até 21x sem juros no cartão.",
  },
  todas: {
    title: "Catálogo",
    text: "Todas as bicicletas da SB Place. Preços e disponibilidade sujeitos a alteração — confirme pelo WhatsApp.",
  },
};

function buildHref({ categoria, condicao, busca }) {
  const qs = new URLSearchParams();
  if (condicao) qs.set("condicao", condicao);
  if (categoria) qs.set("categoria", categoria);
  if (busca) qs.set("busca", busca);
  const str = qs.toString();
  return str ? `/catalogo?${str}` : "/catalogo";
}

export default async function CatalogoPage({ searchParams }) {
  const params = await searchParams;
  const categoria = params?.categoria || "";
  const busca = params?.busca || "";
  const condicao = CONDITIONS.some((c) => c.value === params?.condicao)
    ? params.condicao
    : "";

  const bikes = listBikes({
    onlyPublic: true,
    category: categoria || undefined,
    condition: condicao || undefined,
    search: busca || undefined,
  });

  const heading = HEADINGS[condicao || "todas"];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-ink text-paper">
          <div className="container-page py-12 md:py-20">
            <h1 className="display text-5xl md:text-7xl">{heading.title}</h1>
            <p className="mt-4 max-w-xl text-base text-mist md:text-lg">
              {heading.text}
            </p>
          </div>
        </section>

        <section className="border-b border-hairline">
          <div className="container-page flex flex-col gap-4 py-5 md:flex-row md:flex-wrap md:items-center md:gap-3">
            <div className="flex flex-wrap gap-2">
              <FilterLink
                label="Todas"
                href={buildHref({ categoria, busca })}
                active={!condicao}
              />
              {CONDITIONS.map((c) => (
                <FilterLink
                  key={c.value}
                  label={c.value === "nova" ? "Novas" : "Seminovas"}
                  href={buildHref({ categoria, busca, condicao: c.value })}
                  active={condicao === c.value}
                  gold={c.value === "seminova"}
                />
              ))}
            </div>

            <span aria-hidden className="hidden h-6 w-px bg-hairline md:block" />

            <div className="flex flex-wrap gap-2">
              <FilterLink
                label="Todos os tipos"
                href={buildHref({ condicao, busca })}
                active={!categoria}
                subtle
              />
              {CATEGORIES.map((cat) => (
                <FilterLink
                  key={cat.value}
                  label={cat.label}
                  href={buildHref({ condicao, busca, categoria: cat.value })}
                  active={categoria === cat.value}
                  subtle
                />
              ))}
            </div>

            <form action="/catalogo" method="get" className="md:ml-auto">
              {categoria && (
                <input type="hidden" name="categoria" value={categoria} />
              )}
              {condicao && (
                <input type="hidden" name="condicao" value={condicao} />
              )}
              <input
                type="search"
                name="busca"
                defaultValue={busca}
                placeholder="Buscar bicicleta..."
                aria-label="Buscar bicicleta"
                className="h-10 w-full rounded-full border border-hairline bg-bone px-4 text-sm text-ink placeholder:text-stone focus:border-ink focus:outline-none md:w-64"
              />
            </form>
          </div>
        </section>

        <section>
          <div className="container-page py-10 md:py-16">
            {bikes.length === 0 ? (
              <p className="max-w-lg text-stone">
                Nenhuma bicicleta encontrada com esse filtro. Fale com a gente
                pelo WhatsApp — pode ser que a bike que você procura chegue em
                breve.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {bikes.map((bike, i) => (
                  <BikeCard key={bike.id} bike={bike} variant="light" priority={i < 2} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Só na página de seminovas: como funciona + bike na troca */}
        {condicao === "seminova" && (
          <div className="border-t border-hairline">
            <HowItWorksSection />
            <TradeInSection />
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function FilterLink({ label, href, active, gold, subtle }) {
  const base =
    "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition";
  let style;
  if (active) {
    style = gold ? "bg-gold text-ink" : "bg-ink text-paper";
  } else if (subtle) {
    style = "text-stone hover:text-ink";
  } else {
    style = "border border-hairline text-ink hover:border-ink";
  }
  return (
    <Link href={href} className={`${base} ${style}`}>
      {label}
    </Link>
  );
}
