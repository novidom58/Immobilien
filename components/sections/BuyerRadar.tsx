"use client";

import { useState, type FormEvent } from "react";
import { Radar } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const TYPES = [
  { value: "Haus", label: "Einfamilienhaus" },
  { value: "Wohnung", label: "Eigentumswohnung" },
  { value: "Rendite", label: "Renditeliegenschaft" },
  { value: "Andere", label: "Andere" },
];
const ROOMS = ["", "1.5", "2.5", "3.5", "4.5", "5.5", "6.5", "7"];

// Feste Blip-Positionen (Winkel in Grad, Radius in % des Radars), damit die
// Darstellung stabil bleibt und nichts zufällig springt.
const BLIPS = [
  [20, 62], [75, 38], [130, 70], [200, 48], [255, 80], [310, 32],
  [345, 78], [100, 84], [170, 28], [230, 64], [290, 56], [50, 86],
];

const SCAN_MS = 1800;

const inputClass =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

type Phase = "idle" | "scanning" | "result" | "sent" | "error";

function parsePrice(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export function BuyerRadar() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState({ ort: "", typ: "Haus", zimmer: "", preis: "" });
  const [sending, setSending] = useState(false);

  async function scan(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPhase("scanning");
    const started = Date.now();
    try {
      const res = await fetch("/api/kaeufer-radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ort: criteria.ort,
          typ: criteria.typ,
          zimmer: criteria.zimmer ? Number(criteria.zimmer) : null,
          preis: parsePrice(criteria.preis),
        }),
      });
      const data = await res.json();
      const wait = Math.max(0, SCAN_MS - (Date.now() - started));
      setTimeout(() => {
        if (!res.ok) {
          setError(data.error ?? "Der Käufer-Radar ist gerade nicht verfügbar.");
          setPhase("error");
          return;
        }
        setCount(data.count);
        setPhase("result");
      }, wait);
    } catch {
      setError("Der Käufer-Radar ist gerade nicht verfügbar.");
      setPhase("error");
    }
  }

  async function sendLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    const typLabel = TYPES.find((t) => t.value === criteria.typ)?.label ?? criteria.typ;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "valuation",
        source: "kaeufer-radar",
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        website: form.get("website"),
        message: [
          `Käufer-Radar: ${count ?? 0} passende vorgemerkte Käufer`,
          `Ort: ${criteria.ort}`,
          `Objekt: ${typLabel}`,
          `Zimmer: ${criteria.zimmer || "—"}`,
          `Preisvorstellung: ${criteria.preis || "—"}`,
        ].join("\n"),
      }),
    });
    setSending(false);
    if (res.ok) setPhase("sent");
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Senden fehlgeschlagen. Bitte versuchen Sie es nochmals.");
    }
  }

  const shownBlips = phase === "result" || phase === "sent" ? Math.min(count ?? 0, BLIPS.length) : 0;

  return (
    <section id="kaeufer-radar" className="relative overflow-hidden bg-ink py-28 lg:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10">
        <Reveal>
          <SectionLabel>Käufer-Radar</SectionLabel>
          <h2 className="mt-6 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
            Wer sucht <span className="text-amber-soft">genau Ihre Immobilie?</span>
          </h2>
          <p className="mt-5 max-w-xl text-balance text-lg text-ivory-dim">
            Wir führen eine Kartei mit vorgemerkten Kaufinteressenten und ihren Suchprofilen. Geben Sie die Eckdaten ein
            und sehen Sie sofort, wie viele davon zu Ihrem Objekt passen. Anonym und unverbindlich.
          </p>

          {phase === "idle" || phase === "scanning" || phase === "error" ? (
            <form onSubmit={scan} className="mt-8 grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ivory-dim">Ort</span>
                <input
                  required
                  value={criteria.ort}
                  onChange={(e) => setCriteria({ ...criteria, ort: e.target.value })}
                  placeholder="z.B. Basel, Riehen oder Zug"
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ivory-dim">Objekt</span>
                <select value={criteria.typ} onChange={(e) => setCriteria({ ...criteria, typ: e.target.value })} className={inputClass}>
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ivory-dim">Zimmer</span>
                <select value={criteria.zimmer} onChange={(e) => setCriteria({ ...criteria, zimmer: e.target.value })} className={inputClass}>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>
                      {r === "" ? "Egal" : r === "7" ? "7 und mehr" : r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ivory-dim">
                  Preisvorstellung (optional)
                </span>
                <input
                  inputMode="numeric"
                  value={criteria.preis}
                  onChange={(e) => setCriteria({ ...criteria, preis: e.target.value })}
                  placeholder="z.B. 1'200'000"
                  className={inputClass}
                />
              </label>
              {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
              <button
                type="submit"
                disabled={phase === "scanning"}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-amber px-7 py-4 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:bg-amber-soft disabled:opacity-60 sm:col-span-2 sm:w-fit"
              >
                <Radar className="h-4 w-4" strokeWidth={1.75} />
                {phase === "scanning" ? "Radar sucht …" : "Käufer finden"}
              </button>
            </form>
          ) : phase === "result" ? (
            <div className="mt-8">
              <p className="text-balance text-lg text-ivory">
                {count && count > 0 ? (
                  <>
                    Für eine Immobilie wie Ihre haben wir aktuell{" "}
                    <span className="font-semibold text-amber">
                      {count} vorgemerkte{count === 1 ? "n Käufer" : " Käufer"}
                    </span>
                    . Möchten Sie wissen, wer passt? Wir melden uns diskret bei Ihnen.
                  </>
                ) : (
                  <>
                    Aktuell ist noch kein exakt passendes Suchprofil vorgemerkt. Wir nehmen Ihre Immobilie gerne in unseren
                    Käufer-Alarm auf und melden uns, sobald jemand danach sucht.
                  </>
                )}
              </p>
              <form onSubmit={sendLead} className="mt-6 grid gap-3 sm:grid-cols-2">
                <input name="name" required placeholder="Ihr Name" autoComplete="name" className={`${inputClass} sm:col-span-2`} />
                <input name="email" type="email" required placeholder="E-Mail" autoComplete="email" className={inputClass} />
                <input name="phone" type="tel" placeholder="Telefon (optional)" autoComplete="tel" className={inputClass} />
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
                {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-full bg-amber px-7 py-4 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:bg-amber-soft disabled:opacity-60"
                  >
                    {sending ? "Wird gesendet …" : count ? "Passende Käufer anfragen" : "In den Käufer-Alarm aufnehmen"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase("idle")}
                    className="font-mono text-xs uppercase tracking-wider text-ivory-dim underline underline-offset-4 hover:text-ivory"
                  >
                    Neue Suche
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-200">
              Danke! Wir melden uns persönlich bei Ihnen, in der Regel am selben Werktag.
            </p>
          )}
        </Reveal>

        <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-live="polite">
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
            {[96, 72, 48, 24].map((r) => (
              <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(95,184,232,0.25)" strokeWidth="0.6" />
            ))}
            <path d="M100 4V196M4 100H196" stroke="rgba(95,184,232,0.18)" strokeWidth="0.5" />
            {BLIPS.slice(0, shownBlips).map(([deg, r], i) => {
              const rad = ((deg - 90) * Math.PI) / 180;
              const x = 100 + Math.cos(rad) * (r * 0.96);
              const y = 100 + Math.sin(rad) * (r * 0.96);
              return (
                <g key={i} style={{ animation: `nd-blip .5s ease-out ${i * 0.12}s both` }}>
                  <circle cx={x} cy={y} r="5" fill="rgba(232,168,85,0.18)" />
                  <circle cx={x} cy={y} r="2.2" fill="var(--color-amber)" />
                </g>
              );
            })}
          </svg>

          <div
            aria-hidden
            className={`absolute inset-[2%] rounded-full bg-[conic-gradient(from_0deg,rgba(95,184,232,0.35),rgba(95,184,232,0)_25%)] ${
              phase === "scanning" ? "motion-safe:animate-[nd-spin_1.2s_linear_infinite]" : "motion-safe:animate-[nd-spin_6s_linear_infinite] opacity-50"
            }`}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {phase === "result" || phase === "sent" ? (
              <>
                <span className="font-display text-7xl font-semibold text-amber">{count ?? 0}</span>
                <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">
                  vorgemerkte Käufer
                </span>
              </>
            ) : (
              <>
                <Radar className="h-10 w-10 text-blueprint" strokeWidth={1.25} />
                <span className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">
                  {phase === "scanning" ? "Suche läuft" : "Bereit"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
