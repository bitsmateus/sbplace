import Link from "next/link";
import { formatPrice, installmentText, CATEGORIES } from "@/lib/bike-constants";
import StatusBadge from "./StatusBadge";
import BikePlaceholder from "./BikePlaceholder";

// variant = fundo da seção onde o card está:
//   "light" (branco), "bone" (cinza-areia) ou "dark" (preto)
const VARIANTS = {
  light: {
    card: "bg-bone",
    photo: "bg-[#e6e6e1]",
    placeholder: "text-ink/15",
    name: "text-ink",
    sub: "text-stone",
    price: "text-ink",
  },
  bone: {
    card: "bg-paper",
    photo: "bg-bone",
    placeholder: "text-ink/15",
    name: "text-ink",
    sub: "text-stone",
    price: "text-ink",
  },
  dark: {
    card: "bg-ink-soft",
    photo: "bg-[#1c1c1c]",
    placeholder: "text-paper/15",
    name: "text-paper",
    sub: "text-mist",
    price: "text-gold",
  },
};

export default function BikeCard({ bike, variant = "light" }) {
  const v = VARIANTS[variant] || VARIANTS.light;
  const cover = bike.images?.[0];
  const condition = bike.condition || "nova";
  const categoryLabel =
    CATEGORIES.find((c) => c.value === bike.category)?.label || bike.category;
  const isSold = bike.status === "vendida";
  const showStatus = bike.status && bike.status !== "disponivel";

  return (
    <Link
      href={`/bicicletas/${bike.slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl ${v.card}`}
    >
      <div className={`relative aspect-[4/3] w-full overflow-hidden ${v.photo}`}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/uploads/${cover}`}
            alt={bike.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              isSold ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <BikePlaceholder className={`h-full w-full p-10 ${v.placeholder}`} />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {condition === "seminova" && (
            <span className="inline-block rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink">
              Seminova
            </span>
          )}
          {showStatus && <StatusBadge status={bike.status} />}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className={`text-xl font-semibold leading-tight ${v.name}`}>
          {bike.name}
        </h3>
        <p className={`text-[15px] ${v.sub}`}>{bike.subtitle || categoryLabel}</p>
        <p className={`mt-3 text-2xl font-semibold leading-none ${v.price}`}>
          {formatPrice(bike.priceCents)}
        </p>
        <p className={`text-sm ${v.sub}`}>
          {installmentText(bike)}
          {bike.cashPriceCents > 0 &&
            ` ou ${formatPrice(bike.cashPriceCents)} à vista`}
        </p>
      </div>
    </Link>
  );
}
