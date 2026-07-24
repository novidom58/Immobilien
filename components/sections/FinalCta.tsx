"use client";

import { useState, type FormEvent } from "react";
import { MagneticSubmitButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/lib/reveal";

const CONTACT_EMAIL = "beratung@novidom-immo.ch";

export function FinalCta() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = encodeURIComponent("Kostenlose Immobilienbewertung anfragen");
    const body = encodeURIComponent(
      `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="kontakt" className="relative overflow-hidden bg-ink-2 py-28 lg:py-36">
      <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-amber/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber-soft">
            Begrenzte Plätze pro Monat
          </span>
          <h2 className="mx-auto mt-6 max-w-3xl text-balance font-display text-4xl font-semibold leading-tight text-ivory lg:text-6xl">
            Starten wir Ihren Verkauf.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-lg text-ivory-dim">
            Ein persönliches, exklusives Bewertungsgespräch — unverbindlich
            und kostenlos. Da wir nur wenige Termine pro Monat anbieten,
            lohnt sich eine frühzeitige Anfrage.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-12 flex max-w-lg flex-col gap-4 text-left"
          >
            <input
              required
              type="text"
              placeholder="Ihr Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-line bg-ink px-5 py-4 font-sans text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-line bg-ink px-5 py-4 font-sans text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none"
            />
            <textarea
              placeholder="Kurz zu Ihrer Immobilie (optional)"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none rounded-xl border border-line bg-ink px-5 py-4 font-sans text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none"
            />
            <div className="mt-2 flex justify-center">
              <MagneticSubmitButton className="w-full sm:w-auto">
                Jetzt kostenlose Bewertung sichern
              </MagneticSubmitButton>
            </div>
          </form>
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
