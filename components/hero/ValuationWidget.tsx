"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  VALUATION_REGIONS,
  VALUATION_TYPES,
  estimateValue,
  formatChf,
  type ValuationRegion,
  type ValuationType,
} from "@/lib/valuation";

const fieldClasses =
  "w-full rounded-lg border border-line bg-ink/60 px-3.5 py-2.5 font-sans text-sm text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";

export function ValuationWidget() {
  const [type, setType] = useState<ValuationType>("Haus");
  const [region, setRegion] = useState<ValuationRegion>("Basel-Stadt");
  const [area, setArea] = useState("");
  const [result, setResult] = useState<{ low: number; high: number } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  function handleCalc(e: FormEvent) {
    e.preventDefault();
    const areaNum = Number(area);
    if (!areaNum || areaNum <= 0) return;
    const { low, high } = estimateValue(region, type, areaNum);
    setResult({ low, high });
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!result) return;
    setSendStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "valuation",
          name,
          email,
          message: `Sofort-Richtwert: ${formatChf(result.low)} – ${formatChf(result.high)}\nObjekttyp: ${type}\nRegion: ${region}\nWohnfläche: ${area} m²`,
        }),
      });
      if (!res.ok) {
        setSendStatus("error");
        return;
      }
      setSendStatus("done");
    } catch {
      setSendStatus("error");
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-ivory/15 bg-ink/40 p-5 backdrop-blur-md lg:p-6">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-blueprint">
        <span className="h-1.5 w-1.5 rounded-full bg-blueprint" />
        Sofort-Richtwert
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form
            key="calc"
            onSubmit={handleCalc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            <div className="flex gap-2">
              {VALUATION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 rounded-lg border px-2.5 py-2 font-sans text-xs transition-colors ${
                    type === t
                      ? "border-amber bg-amber/10 text-amber-soft"
                      : "border-line bg-ink/60 text-ivory-dim hover:border-ivory-dim/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as ValuationRegion)}
                className={`${fieldClasses} appearance-none`}
              >
                {VALUATION_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                required
                inputMode="numeric"
                placeholder="Wohnfläche m²"
                value={area}
                onChange={(e) => setArea(e.target.value.replace(/[^\d]/g, ""))}
                className={fieldClasses}
              />
            </div>
            <button
              type="submit"
              disabled={!area}
              className="mt-1 w-full rounded-lg bg-amber px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-ink transition-opacity disabled:opacity-40"
            >
              Richtwert berechnen
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {sendStatus === "done" ? (
              <p className="py-2 text-sm text-ivory">
                Danke, {name.split(" ")[0]}! Wir melden uns mit einer persönlichen Einschätzung.
              </p>
            ) : (
              <>
                <div className="font-display text-2xl font-semibold text-amber-soft">
                  {formatChf(result.low)} – {formatChf(result.high)}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-ivory-dim/60">
                  Automatischer Richtwert auf Basis von Ø-Marktpreisen — keine
                  formelle Bewertung. Für eine exakte Einschätzung inkl.
                  Besichtigung:
                </p>
                <form onSubmit={handleSend} className="mt-3 flex flex-col gap-2">
                  <input
                    required
                    type="text"
                    placeholder="Ihr Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClasses}
                  />
                  <input
                    required
                    type="email"
                    placeholder="Ihre E-Mail-Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClasses}
                  />
                  {sendStatus === "error" && (
                    <p className="text-xs text-red-400">Senden fehlgeschlagen, bitte erneut versuchen.</p>
                  )}
                  <div className="mt-1 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
                    >
                      Zurück
                    </button>
                    <button
                      type="submit"
                      disabled={sendStatus === "sending"}
                      className="flex-1 rounded-lg bg-amber px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wide text-ink transition-opacity disabled:opacity-60"
                    >
                      {sendStatus === "sending" ? "Wird gesendet…" : "Per E-Mail & Gespräch anfragen"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
