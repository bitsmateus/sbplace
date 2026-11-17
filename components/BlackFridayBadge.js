// Selo preto "Black Friday" — marcação provisória da bike (campo blackFriday).
// Quem decide se aparece é isBlackFriday() em lib/bike-constants.js.
export default function BlackFridayBadge({ size = "sm" }) {
  return (
    <span
      className={`inline-block rounded-full border border-paper/25 bg-ink font-bold uppercase tracking-wide text-paper ${
        size === "lg" ? "px-3 py-1.5 text-xs" : "px-2.5 py-1 text-[11px]"
      }`}
    >
      Black Friday
    </span>
  );
}
