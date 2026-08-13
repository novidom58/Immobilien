"use client";

import { useState, type FormEvent } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const PROPERTY_TYPES = ["Einfamilienhaus", "Doppelhaushälfte", "Eigentumswohnung", "Mehrfamilienhaus"];
const CONDITIONS = ["Sehr gut (renoviert)", "Gut (gepflegt)", "Mittel", "Renovationsbedürftig"];

const checkList = [
  "Marktwert nach IAZI/CIFI-Modell — bankanerkannt",
  "Vergleich mit aktuellen Transaktionspreisen in der Region",
  "Belehnung und Bankakzeptanz des Kaufpreises",
  "Renovationsbedarf und Auswirkung auf den Belehnungswert",
];
const whyList = [
  "Banken belehnen nur bis zum bankinternen Schätzwert — nicht nach dem Kaufpreis",
  "Ist der Preis zu hoch, muss der Käufer die Differenz aus eigenen Mitteln decken",
  "Sie haben eine stärkere Verhandlungsposition gegenüber dem Käufer",
  "Wir erkennen frühzeitig, wenn ein Objekt nicht voll finanzierbar ist",
];

const fieldClasses =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

export function PropertyValuationLead() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [name, setName] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    const message = [
      `Objektart: ${form.get("propertyType") || "—"}`,
      `Adresse: ${form.get("address") || "—"}`,
      `PLZ/Ort: ${form.get("place") || "—"}`,
      `Wohnfläche: ${form.get("area") || "—"} m²`,
      `Baujahr: ${form.get("year") || "—"}`,
      `Zimmer: ${form.get("rooms") || "—"}`,
      `Grundstücksfläche: ${form.get("land") || "—"} m²`,
      `Zustand: ${form.get("condition") || "—"}`,
    ].join("\n");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "valuation",
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          message,
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="bewertung" className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionLabel>Kostenlose Immobilienbewertung</SectionLabel>
            <h2 className="mt-6 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Was ist Ihre Immobilie
              <br />
              <span className="text-amber-soft italic">wirklich wert?</span>
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
              Wir bewerten Ihre Immobilie mit dem bankanerkannten
              IAZI-Modell — demselben Tool, das Schweizer Banken intern für
              Hypothekarvergaben verwenden.
            </p>

            <div className="mt-8 rounded-2xl border border-line bg-ink p-6">
              <div className="font-mono text-xs uppercase tracking-wide text-amber">
                Was wir mit IAZI prüfen
              </div>
              <ul className="mt-3 space-y-2.5">
                {checkList.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ivory-dim">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 rounded-2xl border border-line bg-ink p-6">
              <div className="font-mono text-xs uppercase tracking-wide text-amber">
                Warum das wichtig ist
              </div>
              <ul className="mt-3 space-y-2.5">
                {whyList.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ivory-dim">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:mt-11">
            {status === "done" ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-line bg-ink p-10 text-center">
                <h3 className="font-display text-2xl font-semibold text-ivory">
                  Danke{name ? `, ${name.split(" ")[0]}` : ""}!
                </h3>
                <p className="mt-3 max-w-sm text-ivory-dim">
                  Wir melden uns innert kurzer Zeit mit Ihrer persönlichen
                  IAZI-Einschätzung.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-ink p-6 lg:p-8"
              >
                <select name="propertyType" required defaultValue="" className={fieldClasses}>
                  <option value="" disabled>
                    Art der Immobilie
                  </option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input name="address" required placeholder="Strasse & Hausnummer" className={fieldClasses} />
                <input name="place" required placeholder="PLZ / Ort" className={fieldClasses} />
                <div className="grid grid-cols-2 gap-3">
                  <input name="area" type="number" placeholder="Wohnfläche m²" className={fieldClasses} />
                  <input name="year" type="number" placeholder="Baujahr" className={fieldClasses} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input name="rooms" type="number" step="0.5" placeholder="Zimmer (z.B. 5.5)" className={fieldClasses} />
                  <input name="land" type="number" placeholder="Grundstück m²" className={fieldClasses} />
                </div>
                <select name="condition" defaultValue="" className={fieldClasses}>
                  <option value="" disabled>
                    Zustand
                  </option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  name="name"
                  required
                  placeholder="Ihr Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClasses}
                />
                <input name="email" type="email" required placeholder="Ihre E-Mail" className={fieldClasses} />
                <input name="phone" type="tel" placeholder="Telefon (optional)" className={fieldClasses} />
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                {status === "error" && (
                  <p className="text-sm text-red-400">Senden fehlgeschlagen, bitte erneut versuchen.</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-2 rounded-full bg-amber px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-ink disabled:opacity-60"
                >
                  {status === "sending" ? "Wird gesendet…" : "Kostenlose Bewertung anfragen →"}
                </button>
                <p className="text-center text-xs text-ivory-dim/50">
                  Kostenlos · Unverbindlich · In Rekordzeit
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
