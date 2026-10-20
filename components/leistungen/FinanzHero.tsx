"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { checkFinance } from "@/lib/finance";

function chf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

/** Kurz für kleine Kacheln: 1.08 Mio. bzw. 850'000 */
function compact(value: number) {
  return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(2)} Mio.` : chf(value).replace("CHF ", "");
}

function format(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("de-CH").replace(/[’,\s]/g, "'") : "";
}

function parse(value: string) {
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// Eigenes Bild (KI-generiert, Higgsfield), damit keine fremden Bildrechte im Spiel sind.
const MUENSTER = "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20261020_211922_655cc7b3-9f47-4d64-8be3-d30a2dd67b41.png";

const STATUS = {
  ok: { icon: CheckCircle2, text: "Voraussichtlich tragbar", tone: "text-emerald-700" },
  knapp: { icon: AlertTriangle, text: "Knapp, oft mit Optimierung machbar", tone: "text-amber-700" },
  nein: { icon: XCircle, text: "So noch nicht tragbar", tone: "text-red-700" },
} as const;

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-ivory tabular-nums placeholder:text-ivory-dim/60 focus:border-amber focus:outline-none";

/**
 * Kopf der Finanzieren-Seite: Basel mit dem Münster im Hintergrund und der
 * Schnell-Check gleich daneben. Drei Zahlen genügen für eine erste Antwort;
 * die ausführliche Analyse folgt weiter unten.
 */
export function FinanzHero() {
  const [price, setPrice] = useState("1'000'000");
  const [savings, setSavings] = useState("250'000");
  const [income, setIncome] = useState("190'000");

  const result = checkFinance({ price: parse(price), savings: parse(savings), pension: 0, income: parse(income) });
  const status = result.status !== "offen" ? STATUS[result.status] : null;

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-10">
      <div className="relative overflow-hidden rounded-[28px] shadow-[0_30px_80px_-30px_rgba(41,37,27,0.35)]">
        <Image src={MUENSTER} alt="Basel mit Münster am Rhein" fill sizes="(min-width: 1280px) 1200px, 100vw" preload className="object-cover object-[50%_35%]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[rgba(28,40,50,0.82)] via-[rgba(28,40,50,0.55)] to-[rgba(28,40,50,0.25)]" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_420px] lg:items-center lg:p-14">
          <div className="text-white">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/75">Mit HypoCasa · Basel &amp; Zug</div>
            <h2 className="mt-4 max-w-md text-balance font-display text-3xl leading-tight lg:text-5xl">
              Wie viel Haus liegt <em>für Sie drin?</em>
            </h2>
            <p className="mt-4 max-w-md text-white/80">
              Drei Zahlen, eine erste Antwort nach den Regeln der Schweizer Banken. Die verbindliche Prüfung machen wir mit über 50 Anbietern.
            </p>
          </div>

          <div className="rounded-2xl bg-white/95 p-5 backdrop-blur sm:p-6" aria-live="polite">
            <div className="font-display text-xl text-ivory">Schnell-Check</div>
            <div className="mt-4 grid gap-3">
              <label className="block text-sm text-ivory-dim">
                Kaufpreis
                <input inputMode="numeric" value={price} onChange={(e) => setPrice(format(e.target.value))} className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-ivory-dim">
                Eigenmittel (Erspartes, 3a)
                <input inputMode="numeric" value={savings} onChange={(e) => setSavings(format(e.target.value))} className={`${field} mt-1`} />
              </label>
              <label className="block text-sm text-ivory-dim">
                Haushaltseinkommen brutto / Jahr
                <input inputMode="numeric" value={income} onChange={(e) => setIncome(format(e.target.value))} className={`${field} mt-1`} />
              </label>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-ink-2 p-2.5">
                <div className="font-display text-lg text-ivory tabular-nums">{Math.round((result.equityRatio ?? 0) * 100)}%</div>
                <div className="text-[10px] leading-tight text-ivory-dim">Eigenmittel (min. 20%)</div>
              </div>
              <div className="rounded-xl bg-ink-2 p-2.5">
                <div className="font-display text-lg text-ivory tabular-nums">{result.burden !== null ? `${Math.round(result.burden * 100)}%` : "—"}</div>
                <div className="text-[10px] leading-tight text-ivory-dim">Tragbarkeit (max. 33%)</div>
              </div>
              <div className="rounded-xl bg-ink-2 p-2.5">
                <div className="font-display text-lg text-ivory tabular-nums">{result.maxPrice ? compact(result.maxPrice) : "—"}</div>
                <div className="text-[10px] leading-tight text-ivory-dim">max. Kaufpreis CHF</div>
              </div>
            </div>
            {status && (
              <div className={`mt-3 flex items-center gap-2 text-sm font-semibold ${status.tone}`}>
                <status.icon className="h-4 w-4" strokeWidth={2} />
                {status.text}
              </div>
            )}

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <a href="#kontakt" className="rounded-full bg-amber px-4 py-3 text-center text-sm font-semibold text-white hover:opacity-90">
                Kostenlos beraten lassen
              </a>
              <a href="#analyse" className="rounded-full border border-line px-4 py-3 text-center text-sm font-semibold text-ivory hover:border-ivory">
                Ausführliche Analyse
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 px-2 text-xs text-ivory-dim">Richtwerte mit 5% kalkulatorischem Zins und 1% Nebenkosten, keine Zusage.</p>
    </section>
  );
}
