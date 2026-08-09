"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MagneticSubmitButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/lib/reveal";

const CONTACT_EMAIL = "beratung@novidom-immo.ch";
const PROPERTY_TYPES = ["Haus", "Wohnung", "Andere"] as const;
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

const fieldClasses =
  "w-full rounded-xl border border-line bg-ink px-5 py-4 font-sans text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";

export function FinalCta() {
  const [step, setStep] = useState<1 | 2>(1);
  const [propertyType, setPropertyType] = useState<(typeof PROPERTY_TYPES)[number] | null>(null);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleNext(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!propertyType || !address.trim()) return;
    setStep(2);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "valuation",
          name,
          email,
          phone,
          message: `Objekttyp: ${propertyType}\nAdresse: ${address}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Anfrage konnte nicht gesendet werden.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMsg("Anfrage konnte nicht gesendet werden.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <section id="kontakt" className="relative overflow-hidden bg-ink-2 py-28 lg:py-36">
        <div className="relative mx-auto max-w-2xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Vielen Dank, {name.split(" ")[0] || "für Ihre Anfrage"}!
            </h2>
            <p className="mt-6 text-balance text-lg text-ivory-dim">
              Wir melden uns innert kurzer Zeit persönlich bei Ihnen.
            </p>
            {CAL_LINK && (
              <a
                href="#termin"
                className="mt-8 inline-block rounded-full bg-amber px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-ink"
              >
                Oder direkt Termin wählen ↑
              </a>
            )}
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="relative overflow-hidden bg-ink-2 py-28 lg:py-36">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-soft">
            Unverbindlich &amp; kostenlos
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl text-balance font-display text-4xl font-semibold leading-tight text-ivory lg:text-6xl">
            Starten wir Ihren Verkauf.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ivory-dim">
            Ein persönliches Bewertungsgespräch mit Jana Schnuderl —
            unverbindlich und kostenlos.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-lg">
            <div className="mb-6 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wide text-ivory-dim/50">
              <span className={step === 1 ? "text-amber-soft" : ""}>1. Immobilie</span>
              <span className="h-px w-8 bg-line" />
              <span className={step === 2 ? "text-amber-soft" : ""}>2. Kontakt</span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  onSubmit={handleNext}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 text-left"
                >
                  <div className="flex gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPropertyType(type)}
                        className={`flex-1 rounded-xl border px-4 py-3 font-sans text-sm transition-colors ${
                          propertyType === type
                            ? "border-amber bg-amber/10 text-amber-soft"
                            : "border-line bg-ink text-ivory-dim hover:border-ivory-dim/40"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="Adresse Ihrer Immobilie"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={fieldClasses}
                  />
                  <MagneticSubmitButton className="w-full justify-center sm:w-auto sm:self-center" disabled={!propertyType || !address.trim()}>
                    Weiter
                  </MagneticSubmitButton>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-4 text-left"
                >
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
                  <input
                    type="tel"
                    placeholder="Telefon (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClasses}
                  />
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                  {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}
                  <div className="mt-1 flex items-center justify-center gap-5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
                    >
                      Zurück
                    </button>
                    <MagneticSubmitButton disabled={status === "sending"}>
                      {status === "sending" ? "Wird gesendet…" : "Jetzt kostenlose Bewertung sichern"}
                    </MagneticSubmitButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-8 text-sm text-ivory-dim">
            Oder direkt schreiben:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-amber-soft underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
