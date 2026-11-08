"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft } from "lucide-react";
import { VALUATION_REGIONS, formatChf } from "@/lib/valuation";
import { saveEigentum } from "@/app/dashboard/actions";

// Gleiche Objektarten und Fragen wie die kostenlose Bewertung, damit
// Eigentümer überall dasselbe gefragt werden.
const PROPERTY_TYPES = [
  { label: "Einfamilienhaus", typ: "Haus" },
  { label: "Doppelhaushälfte", typ: "Haus" },
  { label: "Eigentumswohnung", typ: "Wohnung" },
  { label: "Mehrfamilienhaus", typ: "Haus" },
] as const;
const CONDITIONS = ["Sehr gut (renoviert)", "Gut (gepflegt)", "Mittel", "Renovationsbedürftig"];
const STEP_TITLES = ["Objektart", "Eckdaten", "Adresse", "Hypothek & Kontakt"];
const STEP_HINTS = [
  "Wählen Sie den passenden Typ, dann geht's direkt weiter.",
  "Je genauer Ihre Angaben, desto präziser der Richtwert.",
  "Nur für die lokale Markteinschätzung, bleibt vertraulich.",
  "Fast geschafft! Der Hypothekenwächter ist freiwillig.",
];
const TOTAL = STEP_TITLES.length;

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";
const small = "mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-ivory-dim";

type Initial = {
  region?: string;
  typ?: string;
  objektart?: string | null;
  flaeche?: number;
  zimmer?: number | null;
  baujahr?: number | null;
  grundstueck?: number | null;
  zustand?: string | null;
  adresse?: string | null;
  hypo_ablauf?: string | null;
  hypo_betrag?: number | null;
};

/** Region aus der PLZ ableiten (nur als Vorschlag, bleibt änderbar). */
function regionFromPlz(text: string) {
  const plz = Number(text.match(/\b(\d{4})\b/)?.[1]);
  if (!plz) return null;
  if (plz >= 4000 && plz <= 4059) return "Basel-Stadt";
  if (plz >= 6300 && plz <= 6349) return "Zug";
  if ((plz >= 4500 && plz <= 4599) || (plz >= 4600 && plz <= 4659) || (plz >= 4700 && plz <= 4719) || plz === 4143 || plz === 4206) return "Solothurn";
  if (plz >= 4100 && plz <= 4499) return "Basel-Landschaft";
  return "Andere";
}

/**
 * Wertmonitor und Hypothekenwächter als Schritt-Funnel im Look der
 * kostenlosen Bewertung. Öffentlich (mit Name/E-Mail) oder im Kundenportal.
 */
export function WertmonitorForm({ portal = false, initial }: { portal?: boolean; initial?: Initial | null }) {
  const initialType =
    initial?.objektart ?? (initial?.typ === "Wohnung" || initial?.typ === "Stockwerkeigentum" ? "Eigentumswohnung" : initial?.typ ? "Einfamilienhaus" : "");
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState<string>(initialType);
  const [region, setRegion] = useState<string>(initial?.region ?? "Basel-Stadt");
  const [state, setState] = useState<{ busy: boolean; error: string | null; wert: { low: number; high: number } | null }>({
    busy: false,
    error: null,
    wert: null,
  });
  const formRef = useRef<HTMLFormElement>(null);
  const isApartment = propertyType === "Eigentumswohnung";
  const typ = PROPERTY_TYPES.find((t) => t.label === propertyType)?.typ ?? "Haus";

  function stepValid() {
    const fields = formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>(`[data-step="${step}"] [required]`);
    for (const f of fields ?? []) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return false;
      }
    }
    return true;
  }

  function pickType(label: string) {
    setPropertyType(label);
    setTimeout(() => setStep(2), 280);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepValid()) return;
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    const data = {
      ...raw,
      typ,
      objektart: propertyType,
      region,
      adresse: [raw.strasse, raw.ort].map((v) => (v ?? "").trim()).filter(Boolean).join(", "),
    };
    setState({ busy: true, error: null, wert: null });
    if (portal) {
      const res = await saveEigentum(data);
      setState({ busy: false, error: res.error, wert: res.wert ?? null });
      return;
    }
    try {
      // Herkunft aus dem QR-Link (/wert?q=…), z.B. ein Türhänger in einem Quartier.
      const quelle = new URLSearchParams(window.location.search).get("quelle");
      const res = await fetch("/api/wertmonitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, consent: raw.consent === "on", quelle }),
      });
      const json = await res.json().catch(() => ({}));
      setState({ busy: false, error: res.ok ? null : (json.error ?? "Senden fehlgeschlagen."), wert: res.ok ? json.wert : null });
    } catch {
      setState({ busy: false, error: "Senden fehlgeschlagen.", wert: null });
    }
  }

  if (state.wert) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15">
          <Check className="h-6 w-6 text-amber" strokeWidth={1.5} />
        </div>
        <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Richtwert heute</div>
        <div className="mt-2 font-display text-3xl text-ivory" aria-live="polite">
          {formatChf(state.wert.low)} – {formatChf(state.wert.high)}
        </div>
        <p className="mt-3 max-w-sm text-sm text-ivory-dim">
          {portal
            ? "Gespeichert. Sie sehen den Richtwert oben und erhalten jedes Quartal den neuen Wert."
            : "Ihr Wertmonitor ist aktiv. Sie erhalten jedes Quartal den aktuellen Richtwert per Mail."}
        </p>
        <button type="button" onClick={() => {
            setState({ busy: false, error: null, wert: null });
            setStep(1);
          }} className="mt-5 text-sm text-amber underline underline-offset-4">
          Angaben ändern
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-ivory-dim/70">
          Schritt {step} von {TOTAL} — {STEP_TITLES[step - 1]}
        </span>
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ivory-dim/70 hover:text-ivory"
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Zurück
          </button>
        )}
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-3">
        <motion.div
          initial={false}
          animate={{ width: `${(step / TOTAL) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-amber"
        />
      </div>
      <p className="mt-2 text-xs text-ivory-dim/70">{STEP_HINTS[step - 1]}</p>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-6">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <div data-step="1" className={step === 1 ? "grid animate-[fadeIn_0.3s_ease-out] grid-cols-2 gap-3" : "hidden"}>
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => pickType(t.label)}
              className={`rounded-xl border px-4 py-6 text-center font-display text-sm font-medium transition-colors ${
                propertyType === t.label ? "border-amber bg-amber/10 text-amber" : "border-line text-ivory-dim hover:border-amber/40 hover:text-ivory"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div data-step="2" className={step === 2 ? "flex animate-[fadeIn_0.3s_ease-out] flex-col gap-3" : "hidden"}>
          <div className="grid grid-cols-2 gap-3">
            <input name="flaeche" inputMode="numeric" required={step === 2} defaultValue={initial?.flaeche ?? ""} placeholder="Wohnfläche m²" className={field} />
            <input name="baujahr" inputMode="numeric" defaultValue={initial?.baujahr ?? ""} placeholder="Baujahr" className={field} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="zimmer" inputMode="decimal" defaultValue={initial?.zimmer ?? ""} placeholder="Zimmer (z.B. 5.5)" className={field} />
            {isApartment ? (
              <input name="etage" inputMode="numeric" placeholder="Etage" className={field} />
            ) : (
              <input name="grundstueck" inputMode="numeric" defaultValue={initial?.grundstueck ?? ""} placeholder="Grundstück m²" className={field} />
            )}
          </div>
          <select name="zustand" defaultValue={initial?.zustand ?? ""} className={field}>
            <option value="" disabled>
              Zustand
            </option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div data-step="3" className={step === 3 ? "flex animate-[fadeIn_0.3s_ease-out] flex-col gap-3" : "hidden"}>
          <input name="strasse" defaultValue={initial?.adresse?.split(",")[0] ?? ""} placeholder="Strasse & Hausnummer" autoComplete="street-address" className={field} />
          <input
            name="ort"
            required={step === 3}
            defaultValue={initial?.adresse?.split(",").slice(1).join(",").trim() ?? ""}
            placeholder="PLZ / Ort"
            onBlur={(e) => {
              const r = regionFromPlz(e.target.value);
              if (r) setRegion(r);
            }}
            className={field}
          />
          <label>
            <span className={small}>Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className={field}>
              {VALUATION_REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>

        <div data-step="4" className={step === 4 ? "flex animate-[fadeIn_0.3s_ease-out] flex-col gap-3" : "hidden"}>
          <div className="rounded-xl bg-ink-2 p-4">
            <div className="text-sm font-semibold text-ivory">Hypothekenwächter (optional)</div>
            <p className="mt-1 text-xs text-ivory-dim">Wann läuft Ihre Festhypothek aus? Wir melden uns rechtzeitig mit einem Vergleich über 50 Anbieter.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label>
                <span className={small}>Läuft ab am</span>
                <input name="hypo_ablauf" type="date" defaultValue={initial?.hypo_ablauf ?? ""} className={field} />
              </label>
              <label>
                <span className={small}>Höhe CHF</span>
                <input name="hypo_betrag" inputMode="numeric" defaultValue={initial?.hypo_betrag ?? ""} placeholder="z.B. 650'000" className={field} />
              </label>
            </div>
          </div>
          {!portal && (
            <>
              <input name="name" required={step === 4} autoComplete="name" placeholder="Ihr Name" className={field} />
              <input name="email" type="email" required={step === 4} autoComplete="email" placeholder="Ihre E-Mail" className={field} />
              <label className="mt-1 flex items-start gap-2.5 text-xs leading-relaxed text-ivory-dim">
                <input type="checkbox" name="consent" required={step === 4} className="mt-0.5 h-4 w-4 shrink-0 accent-amber" />
                <span>
                  Ich möchte jedes Quartal den Wertmonitor per E-Mail erhalten (Abmeldung jederzeit) und bin mit der{" "}
                  <a href="/datenschutz" target="_blank" className="text-amber underline underline-offset-2">
                    Datenschutzerklärung
                  </a>{" "}
                  einverstanden.
                </span>
              </label>
            </>
          )}
        </div>

        {state.error && <p className="mt-3 text-sm text-[#c0392b]">{state.error}</p>}

        {step < TOTAL ? (
          step > 1 && (
            <button
              type="button"
              onClick={() => stepValid() && setStep(step + 1)}
              className="mt-5 w-full rounded-full bg-amber px-6 py-3.5 font-sans text-sm font-semibold uppercase tracking-wide text-white"
            >
              Weiter →
            </button>
          )
        ) : (
          <button
            type="submit"
            disabled={state.busy}
            className="mt-5 w-full rounded-full bg-amber px-6 py-3.5 font-sans text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-60"
          >
            {state.busy ? "Wird berechnet…" : portal ? "Speichern & Wert berechnen →" : "Wertmonitor starten →"}
          </button>
        )}
      </form>
    </div>
  );
}
