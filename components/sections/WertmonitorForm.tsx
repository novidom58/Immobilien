"use client";

import { useState, type FormEvent } from "react";
import { LineChart } from "lucide-react";
import { VALUATION_REGIONS, VALUATION_TYPES, formatChf } from "@/lib/valuation";
import { saveEigentum } from "@/app/dashboard/actions";

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-ivory placeholder:text-ivory-dim/60 focus:border-amber focus:outline-none";
const label = "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ivory-dim";

type Initial = {
  region?: string;
  typ?: string;
  flaeche?: number;
  zimmer?: number | null;
  baujahr?: number | null;
  adresse?: string | null;
  hypo_ablauf?: string | null;
  hypo_betrag?: number | null;
};

/**
 * Wertmonitor und Hypothekenwächter in einem Formular. Öffentlich (mit
 * Name/E-Mail) oder im Kundenportal (Login reicht).
 */
export function WertmonitorForm({ portal = false, initial }: { portal?: boolean; initial?: Initial | null }) {
  const [state, setState] = useState<{ busy: boolean; error: string | null; wert: { low: number; high: number } | null }>({
    busy: false,
    error: null,
    wert: null,
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setState({ busy: true, error: null, wert: null });
    if (portal) {
      const res = await saveEigentum(data);
      setState({ busy: false, error: res.error, wert: res.wert ?? null });
      return;
    }
    try {
      const res = await fetch("/api/wertmonitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, consent: data.consent === "on" }),
      });
      const json = await res.json().catch(() => ({}));
      setState({ busy: false, error: res.ok ? null : (json.error ?? "Senden fehlgeschlagen."), wert: res.ok ? json.wert : null });
    } catch {
      setState({ busy: false, error: "Senden fehlgeschlagen.", wert: null });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {!portal && (
        <>
          <label>
            <span className={label}>Name</span>
            <input name="name" required autoComplete="name" className={field} />
          </label>
          <label>
            <span className={label}>E-Mail</span>
            <input name="email" type="email" required autoComplete="email" className={field} />
          </label>
        </>
      )}
      <label>
        <span className={label}>Region</span>
        <select name="region" defaultValue={initial?.region ?? "Basel-Stadt"} className={field}>
          {VALUATION_REGIONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={label}>Objektart</span>
        <select name="typ" defaultValue={initial?.typ ?? "Haus"} className={field}>
          {VALUATION_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={label}>Wohnfläche m²</span>
        <input name="flaeche" inputMode="numeric" required defaultValue={initial?.flaeche ?? ""} placeholder="z.B. 140" className={field} />
      </label>
      <label>
        <span className={label}>Baujahr (optional)</span>
        <input name="baujahr" inputMode="numeric" defaultValue={initial?.baujahr ?? ""} placeholder="z.B. 1995" className={field} />
      </label>
      <label className="sm:col-span-2">
        <span className={label}>Adresse (optional)</span>
        <input name="adresse" defaultValue={initial?.adresse ?? ""} autoComplete="street-address" className={field} />
      </label>

      <div className="rounded-2xl bg-ink-2 p-4 sm:col-span-2">
        <div className="font-semibold text-ivory">Hypothekenwächter (optional)</div>
        <p className="mt-1 text-sm text-ivory-dim">Wann läuft Ihre Festhypothek aus? Wir melden uns rechtzeitig mit einem Vergleich über 50 Anbieter.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <span className={label}>Läuft ab am</span>
            <input name="hypo_ablauf" type="date" defaultValue={initial?.hypo_ablauf ?? ""} className={field} />
          </label>
          <label>
            <span className={label}>Höhe CHF</span>
            <input name="hypo_betrag" inputMode="numeric" defaultValue={initial?.hypo_betrag ?? ""} placeholder="z.B. 650'000" className={field} />
          </label>
        </div>
      </div>

      {!portal && (
        <label className="flex items-start gap-2 text-sm text-ivory-dim sm:col-span-2">
          <input type="checkbox" name="consent" required className="mt-1" />
          Ich möchte jedes Quartal den Wertmonitor per E-Mail erhalten. Abmeldung jederzeit.
        </label>
      )}

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={state.busy} className="inline-flex items-center gap-2 rounded-full bg-night px-6 py-3.5 text-sm font-semibold text-ink hover:bg-amber disabled:opacity-60">
          <LineChart className="h-4 w-4" strokeWidth={1.75} />
          {state.busy ? "Wird berechnet …" : portal ? "Speichern & Wert berechnen" : "Wertmonitor starten"}
        </button>
        {state.wert && (
          <span className="text-sm text-ivory" aria-live="polite">
            Richtwert heute: <span className="font-display text-xl text-amber">{formatChf(state.wert.low)} – {formatChf(state.wert.high)}</span>
          </span>
        )}
      </div>
      {state.error && <p className="text-sm text-[#c0392b] sm:col-span-2">{state.error}</p>}
    </form>
  );
}
