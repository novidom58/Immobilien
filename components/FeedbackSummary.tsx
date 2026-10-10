import { Star } from "lucide-react";
import { INTERESSE_LABEL, PREIS_LABEL, summarizeFeedback, type ViewingFeedback } from "@/lib/feedback";

/** Besichtigungsfeedback auf einen Blick, für Verkäufer im Portal und fürs Team. */
export function FeedbackSummary({ items }: { items: ViewingFeedback[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ivory-dim">Noch kein Feedback. Nach jeder Besichtigung schicken wir den Interessenten einen kurzen Fragebogen per WhatsApp.</p>;
  }
  const s = summarizeFeedback(items);
  const bars = (data: Record<string, number>, labels: Record<string, string>) =>
    Object.entries(data).map(([k, v]) => (
      <div key={k} className="flex items-center gap-2 text-xs">
        <span className="w-20 shrink-0 text-ivory-dim">{labels[k]}</span>
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-3">
          <span className="block h-full rounded-full bg-amber" style={{ width: `${s.total ? (v / s.total) * 100 : 0}%` }} />
        </span>
        <span className="w-6 text-right tabular-nums text-ivory">{v}</span>
      </div>
    ));

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-ink p-4">
          <div className="flex items-center gap-1.5 font-display text-2xl text-ivory">
            <Star className="h-5 w-5 fill-amber text-amber" strokeWidth={1.5} />
            {s.avg ? s.avg.toFixed(1) : "—"}
          </div>
          <div className="mt-1 text-[11px] text-ivory-dim">Ø Bewertung aus {s.total} Feedback(s)</div>
        </div>
        <div className="grid content-center gap-1.5 rounded-xl bg-ink p-4">
          <div className="text-[11px] uppercase tracking-wide text-ivory-dim">Preis</div>
          {bars(s.preis, PREIS_LABEL)}
        </div>
        <div className="grid content-center gap-1.5 rounded-xl bg-ink p-4">
          <div className="text-[11px] uppercase tracking-wide text-ivory-dim">Interesse</div>
          {bars(s.interesse, INTERESSE_LABEL)}
        </div>
      </div>
      <ul className="grid gap-3">
        {items.slice(0, 8).map((f) => (
          <li key={f.id} className="rounded-xl bg-ink p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ivory-dim">
              {f.rating && <span className="text-amber">{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</span>}
              <span>{f.name || "Anonym"}</span>
              <span>· {new Date(f.created_at).toLocaleDateString("de-CH")}</span>
            </div>
            {f.positiv && <p className="mt-2 text-ivory">👍 {f.positiv}</p>}
            {f.negativ && <p className="mt-1 text-ivory">👎 {f.negativ}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
