"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-amber/30 bg-amber/10 p-6 text-center">
        <p className="text-ivory">
          Für <span className="text-amber-soft">{email}</span> ist noch kein
          Zugang aktiv.
        </p>
        <p className="mt-2 text-sm text-ivory-dim">
          Das Verkaufs-Cockpit wird automatisch freigeschaltet, sobald Ihr
          Verkaufsmandat mit NoviDom startet. Bis dahin erreichen Sie uns
          direkt über die kostenlose Bewertung.
        </p>
        <Link
          href="/#kontakt"
          className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4"
        >
          Zur kostenlosen Bewertung
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ihre.email@beispiel.ch"
          className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
          Passwort
        </label>
        <input
          id="password"
          required
          type="password"
          placeholder="••••••••"
          className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="mt-2 rounded-full bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-ink transition-shadow hover:shadow-[0_0_40px_-8px_rgba(232,168,85,0.65)]"
      >
        Anmelden
      </button>
    </form>
  );
}
