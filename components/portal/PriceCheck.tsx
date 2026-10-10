import { estimateValue, formatChf, PRICE_STAND, VALUATION_TYPES, type ValuationRegion, type ValuationType } from "@/lib/valuation";

/**
 * Preis-Check für Verkäufer: Angebotspreis pro m² gegen den regionalen
 * Richtwert, ergänzt um die Preis-Einschätzung aus dem Besichtigungsfeedback.
 */
export function PriceCheck({
  price,
  area,
  type,
  region,
  feedback,
}: {
  price: number | null;
  area: number | null;
  type: string | null;
  region: ValuationRegion;
  feedback: { zu_tief: number; passt: number; zu_hoch: number };
}) {
  if (!price || !area) {
    return <p className="text-xs text-ivory-dim/70">Der Preis-Check erscheint, sobald Preis und Wohnfläche im Inserat stehen.</p>;
  }
  const valuationType: ValuationType = (VALUATION_TYPES as readonly string[]).includes(type ?? "") ? (type as ValuationType) : "Haus";
  const ref = estimateValue(region, valuationType, area);
  const diff = (price - ref.mid) / ref.mid;
  const pct = Math.round(diff * 100);
  const totalFb = feedback.zu_tief + feedback.passt + feedback.zu_hoch;
  const position = Math.max(4, Math.min(96, 50 + diff * 150));

  const verdict =
    pct > 12
      ? "Deutlich über dem regionalen Richtwert. Das kann bei besonderer Lage oder Ausstattung passen, verlängert aber oft die Verkaufszeit."
      : pct < -12
        ? "Unter dem regionalen Richtwert. Gut für einen schnellen Verkauf, prüfen wir gemeinsam, ob Potenzial verschenkt wird."
        : "Im Bereich des regionalen Richtwerts.";

  return (
    <div className="rounded-xl bg-ink p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">Preis-Check · {region}</div>
        <div className="text-xs text-ivory-dim">Stand {PRICE_STAND}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="font-display text-xl text-ivory">{formatChf(price / area)}/m²</div>
          <div className="text-[11px] text-ivory-dim">Ihr Angebotspreis</div>
        </div>
        <div>
          <div className="font-display text-xl text-ivory">{formatChf(ref.mid / area)}/m²</div>
          <div className="text-[11px] text-ivory-dim">Richtwert Region</div>
        </div>
      </div>
      <div className="relative mt-4 h-2 rounded-full bg-gradient-to-r from-blueprint/40 via-emerald-500/40 to-amber/50" aria-hidden>
        <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-night" style={{ left: `${position}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ivory-dim">
        <span>günstig</span>
        <span>marktgerecht</span>
        <span>ambitioniert</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ivory-dim">
        {pct > 0 ? "+" : ""}
        {pct}% gegenüber Richtwert. {verdict}
        {totalFb > 0 && ` Aus ${totalFb} Besichtigungen: ${feedback.zu_hoch}× «eher hoch», ${feedback.passt}× «passend», ${feedback.zu_tief}× «eher tief».`}
      </p>
    </div>
  );
}
