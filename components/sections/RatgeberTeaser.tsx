"use client";

import { useState, type FormEvent } from "react";
import { BookOpen } from "lucide-react";
import { Reveal } from "@/lib/reveal";

const chapters = [
  "Kapitel 1: Den richtigen Preis ermitteln (IAZI)",
  "Kapitel 2: Vorbereitung vor dem Verkauf",
  "Kapitel 3: Professionelle Vermarktung",
  "Kapitel 4: Käufer qualifizieren",
  "Kapitel 5: Verhandlung und Kaufvertrag",
  "Kapitel 6: Steuern beim Verkauf",
  "Kapitel 7: Checkliste aller Dokumente",
  "Kapitel 8: Die 5 teuersten Fehler",
];

const fieldClasses =
  "w-full rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

export function RatgeberTeaser() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [name, setName] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "access_request",
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          message: "Ratgeber „1×1 des Immobilienverkaufs in der Schweiz“ angefragt.",
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="ratgeber" className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <Reveal>
            <div className="rounded-2xl border border-amber/20 bg-ink-2 p-8 lg:p-10">
              <BookOpen className="h-8 w-8 text-amber" strokeWidth={1.5} />
              <h3 className="mt-4 text-balance font-display text-2xl font-semibold leading-snug text-ivory">
                «1×1 des Immobilien&shy;verkaufs
                <br />
                <span className="italic text-amber-soft">in der Schweiz»</span>
              </h3>
              <ul className="mt-6 space-y-2.5">
                {chapters.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-ivory-dim">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber/60" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-soft">
              Gratis Download
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Ihr kostenloser
              <br />
              <span className="text-amber-soft">Ratgeber.</span>
            </h2>
            <p className="mt-5 max-w-md text-balance text-lg text-ivory-dim">
              18 Jahre Erfahrung kompakt — damit Sie keinen teuren Fehler
              machen.
            </p>

            {status === "done" ? (
              <p className="mt-8 max-w-sm text-ivory">
                Danke{name ? `, ${name.split(" ")[0]}` : ""}! Wir senden Ihnen
                den Ratgeber in Kürze persönlich per E-Mail.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex max-w-sm flex-col gap-3">
                <input
                  name="name"
                  required
                  placeholder="Vorname Nachname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClasses}
                />
                <input name="email" type="email" required placeholder="E-Mail" className={fieldClasses} />
                <input name="phone" type="tel" placeholder="Mobil (optional)" className={fieldClasses} />
                {status === "error" && (
                  <p className="text-sm text-red-400">Senden fehlgeschlagen, bitte erneut versuchen.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-1 rounded-full bg-amber px-6 py-3.5 font-display text-sm font-semibold uppercase tracking-wide text-ink disabled:opacity-60"
                >
                  {status === "sending" ? "Wird gesendet…" : "Jetzt kostenlos anfordern →"}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
