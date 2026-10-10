import { BadgeCheck, ShieldCheck } from "lucide-react";

function chf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

/**
 * Finanzierungs-Pass: zeigt Käufern, dass sie geprüft zur Besichtigung
 * kommen. «Vorgeprüft» nach dem Selbst-Check, «bestätigt» sobald HypoCasa
 * die Finanzierung verbindlich bestätigt hat (setzt das Team im CRM).
 */
export function FinancePass({
  name,
  maxPrice,
  status,
  savedAt,
}: {
  name: string;
  maxPrice: number | null;
  status: "vorgeprueft" | "bestaetigt" | null;
  savedAt: string | null;
}) {
  if (!maxPrice) {
    return (
      <div className="flex items-start gap-4 rounded-2xl border border-dashed border-amber/50 bg-white p-5">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber" strokeWidth={1.5} />
        <div>
          <div className="font-display text-lg text-ivory">Holen Sie sich Ihren Finanzierungs-Pass</div>
          <p className="mt-1 text-sm text-ivory-dim">
            Einmal unten den Check ausfüllen und speichern. Mit Pass werden Sie bei Besichtigungen bevorzugt eingeladen, weil Verkäufer geprüfte
            Käufer vorziehen.
          </p>
        </div>
      </div>
    );
  }

  const confirmed = status === "bestaetigt";
  return (
    <div className="relative overflow-hidden rounded-2xl bg-night p-6 text-ink">
      <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber/30 blur-2xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-soft">
            <BadgeCheck className="h-4 w-4" strokeWidth={1.75} />
            Finanzierungs-Pass · {confirmed ? "bestätigt durch HypoCasa" : "vorgeprüft"}
          </div>
          <div className="mt-2 font-display text-2xl">{name}</div>
          <div className="mt-1 text-sm text-ink/75">
            Kaufkraft bis <span className="font-semibold text-ink">{chf(maxPrice)}</span>
            {savedAt ? ` · Stand ${new Date(savedAt).toLocaleDateString("de-CH")}` : ""}
          </div>
        </div>
        <span className={`rounded-full px-4 py-2 text-xs font-semibold ${confirmed ? "bg-emerald-500 text-white" : "bg-amber text-white"}`}>
          {confirmed ? "Bestätigt" : "Vorgeprüft"}
        </span>
      </div>
      {!confirmed && (
        <p className="relative mt-4 text-xs leading-relaxed text-ink/70">
          Für die Bestätigung unten «Verbindlich prüfen lassen» wählen. HypoCasa meldet sich innert 24 Stunden.
        </p>
      )}
    </div>
  );
}
