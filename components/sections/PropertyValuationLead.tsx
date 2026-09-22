"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Check, ChevronLeft } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const PROPERTY_TYPES = ["Einfamilienhaus", "Doppelhaushälfte", "Eigentumswohnung", "Mehrfamilienhaus"];
const CONDITIONS = ["Sehr gut (renoviert)", "Gut (gepflegt)", "Mittel", "Renovationsbedürftig"];
const TOTAL_STEPS = 4;

const checkList = [
  "Marktwert nach IAZI- und WUP-Modell — bankanerkannt",
  "Abgleich mit den Schätzmodellen von über 30 Banken",
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
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function goTo(next: number) {
    setStep(next);
  }

  function currentStepValid() {
    const fields = formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      `[data-step="${step}"] [required]`
    );
    if (!fields) return true;
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!currentStepValid()) return;
    goTo(Math.min(step + 1, TOTAL_STEPS));
  }

  function selectPropertyType(type: string) {
    setPropertyType(type);
    setTimeout(() => goTo(2), 280);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentStepValid()) return;
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

  const stepTitles = ["Objektart", "Adresse", "Eckdaten", "Kontakt"];

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
              Der richtige Verkauf beginnt mit einer realistischen
              Einschätzung des Marktwerts. Wir analysieren Ihre Immobilie
              anhand professioneller und bankanerkannter Bewertungsmodelle,
              aktueller Marktdaten und unserer Erfahrung im Immobilien- und
              Finanzierungsbereich.
            </p>

            <div className="mt-8 rounded-2xl border border-line bg-ink p-6">
              <div className="font-mono text-xs uppercase tracking-wide text-amber">
                Was wir mit IAZI &amp; WUP prüfen
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/15">
                  <Check className="h-6 w-6 text-amber" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-ivory">
                  Danke{name ? `, ${name.split(" ")[0]}` : ""}!
                </h3>
                <p className="mt-3 max-w-sm text-ivory-dim">
                  Wir melden uns innert kurzer Zeit mit Ihrer persönlichen
                  IAZI-Einschätzung.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-ink p-6 lg:p-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
                    Schritt {step} von {TOTAL_STEPS} — {stepTitles[step - 1]}
                  </span>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => goTo(step - 1)}
                      className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Zurück
                    </button>
                  )}
                </div>
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink-3">
                  <motion.div
                    initial={false}
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-amber"
                  />
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="mt-6">
                  <div data-step="1" className={step === 1 ? "grid animate-[fadeIn_0.3s_ease-out] grid-cols-2 gap-3" : "hidden"}>
                    {PROPERTY_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => selectPropertyType(t)}
                        className={`rounded-xl border px-4 py-6 text-center font-display text-sm font-medium transition-colors ${
                          propertyType === t
                            ? "border-amber bg-amber/10 text-amber-soft"
                            : "border-line text-ivory-dim hover:border-amber/40 hover:text-ivory"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                    <input type="hidden" name="propertyType" value={propertyType} required />
                  </div>

                  <div data-step="2" className={step === 2 ? "flex animate-[fadeIn_0.3s_ease-out] flex-col gap-3" : "hidden"}>
                    <input name="address" required={step === 2} placeholder="Strasse & Hausnummer" className={fieldClasses} />
                    <input name="place" required={step === 2} placeholder="PLZ / Ort" className={fieldClasses} />
                  </div>

                  <div data-step="3" className={step === 3 ? "flex animate-[fadeIn_0.3s_ease-out] flex-col gap-3" : "hidden"}>
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
                  </div>

                  <div data-step="4" className={step === 4 ? "flex animate-[fadeIn_0.3s_ease-out] flex-col gap-3" : "hidden"}>
                    <input
                      name="name"
                      required={step === 4}
                      placeholder="Ihr Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClasses}
                    />
                    <input name="email" type="email" required={step === 4} placeholder="Ihre E-Mail" className={fieldClasses} />
                    <input name="phone" type="tel" placeholder="Telefon (optional)" className={fieldClasses} />
                  </div>

                  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                  {status === "error" && (
                    <p className="mt-3 text-sm text-red-400">Senden fehlgeschlagen, bitte erneut versuchen.</p>
                  )}

                  {step < TOTAL_STEPS ? (
                    step > 1 && (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="mt-5 w-full rounded-full bg-amber px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-ink"
                      >
                        Weiter →
                      </button>
                    )
                  ) : (
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="mt-5 w-full rounded-full bg-amber px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-ink disabled:opacity-60"
                    >
                      {status === "sending" ? "Wird gesendet…" : "Kostenlose Bewertung anfragen →"}
                    </button>
                  )}
                  <p className="mt-3 text-center text-xs text-ivory-dim/50">
                    Kostenlos · Unverbindlich · In Rekordzeit
                  </p>
                </form>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
