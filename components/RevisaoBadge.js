// Selo roxo "Em revisão" — marcação extra da bike (campo inReview), mostrada
// junto do selo de seminova e do de situação. Quem decide se aparece é
// isInReview() em lib/bike-constants.js.
export default function RevisaoBadge() {
  return (
    <span className="inline-block rounded-full bg-revisao px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-paper">
      Em revisão
    </span>
  );
}
