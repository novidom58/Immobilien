"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { AreaId } from "./areas";

const HOUSE_EARLY =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260724_172033_240313c6-3332-42be-b381-08181cd212e4.png";
const HOUSE_FINISHED =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221242_dc36129e-cfa1-44b7-8b76-e01581d1c775.png";

function formatChf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

function Stepper({ steps }: { steps: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % steps.length), 1100);
    return () => clearInterval(id);
  }, [steps.length]);

  return (
    <ol className="mt-6 flex overflow-x-auto pb-1">
      {steps.map((step, i) => (
        <li key={step} className="relative min-w-[64px] flex-1 px-0.5 pt-6 text-center">
          {i > 0 && (
            <span
              aria-hidden
              className={`absolute left-[-50%] top-[5px] h-0.5 w-full ${i <= active ? "bg-blueprint" : "bg-line"}`}
            />
          )}
          <span
            aria-hidden
            className={`absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 transition-all duration-300 ${
              i === active
                ? "border-amber bg-amber shadow-[0_0_0_5px_rgba(143,106,57,0.28)]"
                : i < active
                  ? "border-blueprint bg-blueprint"
                  : "border-line bg-ink-3"
            }`}
          />
          <span
            className={`mt-2 block font-mono text-[10px] uppercase tracking-wide transition-colors ${
              i === active ? "text-amber-soft" : "text-ivory-dim"
            }`}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber/25 bg-amber/5 p-5 text-sm leading-relaxed text-ivory-dim">
      <strong className="font-semibold text-amber-soft">{title}</strong> {children}
    </div>
  );
}

function Photo({ src }: { src: string }) {
  return (
    <div className="relative h-64 overflow-hidden rounded-2xl border border-line bg-ink-3">
      <Image src={src} alt="" fill sizes="(min-width: 768px) 420px, 100vw" unoptimized className="object-cover" />
    </div>
  );
}

function CtaLink({ label, onNavigate }: { label: string; onNavigate: () => void }) {
  return (
    <a
      href="#kontakt"
      onClick={onNavigate}
      className="mt-8 inline-flex rounded-full bg-amber px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:bg-amber-soft"
    >
      {label}
    </a>
  );
}

function Question({ children }: { children: ReactNode }) {
  return <p className="mt-2 font-display text-lg font-medium text-amber-soft">{children}</p>;
}

function Lede({ children }: { children: ReactNode }) {
  return <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory-dim lg:text-base">{children}</p>;
}

function KaufVerkaufPanel({ onNavigate }: { onNavigate: () => void }) {
  const [tab, setTab] = useState<"verkaufen" | "kaufen">("verkaufen");
  const tabClass = (t: string) =>
    `rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
      tab === t ? "border-amber bg-amber/10 text-amber-soft" : "border-line text-ivory-dim hover:text-ivory"
    }`;

  return (
    <>
      <div className="mt-5 flex gap-2" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "verkaufen"} onClick={() => setTab("verkaufen")} className={tabClass("verkaufen")}>
          Verkaufen
        </button>
        <button type="button" role="tab" aria-selected={tab === "kaufen"} onClick={() => setTab("kaufen")} className={tabClass("kaufen")}>
          Kaufen
        </button>
      </div>

      {tab === "verkaufen" ? (
        <div role="tabpanel">
          <Question>Was ist Ihre Immobilie heute wert?</Question>
          <Lede>Kostenlose, bankanerkannte Einschätzung. Danach begleiten wir Sie bis zur Schlüsselübergabe.</Lede>
          <Stepper steps={["Bewertung", "Strategie", "Vermarktung", "Interessenten", "Verkauf"]} />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Callout title="Auf einen Blick:">
              Sie sehen jederzeit, an welchem Schritt Ihr Verkauf steht, im Kundenportal und im persönlichen Gespräch.
            </Callout>
            <Photo src={HOUSE_FINISHED} />
          </div>
          <CtaLink label="Gratis-Bewertung anfragen" onNavigate={onNavigate} />
        </div>
      ) : (
        <div role="tabpanel">
          <Question>Welches Zuhause passt zu Ihnen?</Question>
          <Lede>Wir finden, prüfen und begleiten, bis der Schlüssel in Ihrer Hand liegt.</Lede>
          <Stepper steps={["Objekt finden", "Prüfen", "Finanzierung", "Kauf", "Schlüssel"]} />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Callout title="Ein Prozess:">
              Suche und Finanzierungsprüfung laufen parallel, nicht nacheinander. Neue passende Objekte melden wir Ihnen automatisch.
            </Callout>
            <Photo src={HOUSE_EARLY} />
          </div>
          <CtaLink label="Suchprofil anlegen" onNavigate={onNavigate} />
        </div>
      )}
    </>
  );
}

function UmbauPanel({ onNavigate }: { onNavigate: () => void }) {
  const [split, setSplit] = useState(50);

  return (
    <>
      <Question>Sie müssen nicht fünf verschiedene Firmen suchen.</Question>
      <Lede>Wir koordinieren den nächsten Schritt, von der ersten Skizze bis zur Übergabe, mit geprüften Fachpartnern.</Lede>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ivory-dim">Von der Idee zur Umsetzung</div>
          <Stepper steps={["Analyse", "Konzept", "Offerte", "Fachpartner", "Umsetzung"]} />
          <div className="mt-6">
            <Callout title="Wertsteigerung im Blick:">Umbauten, die sich beim späteren Verkauf auszahlen.</Callout>
          </div>
        </div>
        <div>
          <div className="relative h-72 select-none overflow-hidden rounded-2xl border border-line bg-ink-3">
            <Image src={HOUSE_EARLY} alt="Vorher" fill sizes="(min-width: 768px) 420px, 100vw" unoptimized className="object-cover" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
              <Image src={HOUSE_FINISHED} alt="Nachher" fill sizes="(min-width: 768px) 420px, 100vw" unoptimized className="object-cover" />
            </div>
            <span className="absolute left-3 top-3 rounded-full border border-line bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">Vorher</span>
            <span className="absolute right-3 top-3 rounded-full border border-line bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">Nachher</span>
            <div
              aria-hidden
              className="absolute inset-y-0 w-0.5 bg-amber shadow-[0_0_14px_2px_rgba(143,106,57,0.28)]"
              style={{ left: `${split}%` }}
            >
              <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber text-xs text-ink shadow-[0_0_0_6px_rgba(143,106,57,0.28)]">
                ↔
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={split}
            onChange={(e) => setSplit(Number(e.target.value))}
            aria-label="Vorher/Nachher-Regler"
            className="mt-3 w-full accent-amber"
          />
        </div>
      </div>
      <CtaLink label="Umbau-Beratung anfragen" onNavigate={onNavigate} />
    </>
  );
}

function FinanzierungPanel() {
  const [price, setPrice] = useState(1_200_000);
  const [equity, setEquity] = useState(300_000);

  const maxEquity = Math.round(price * 0.8);
  const effectiveEquity = Math.min(equity, maxEquity);
  const mortgage = price - effectiveEquity;
  const ratio = (effectiveEquity / price) * 100;
  const ok = ratio >= 20;

  return (
    <>
      <Question>Wie viel Immobilie können Sie sich leisten?</Question>
      <Lede>Ein erster, unverbindlicher Überblick. Die genaue Prüfung übernimmt unser Finanzierungspartner Hypocasa.</Lede>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white/[0.02] p-5">
          <label className="block">
            <span className="flex justify-between font-mono text-[11px] uppercase tracking-wide text-ivory-dim">
              <span>Kaufpreis</span>
              <span className="tabular-nums text-ivory">{formatChf(price)}</span>
            </span>
            <input
              type="range"
              min={300_000}
              max={3_000_000}
              step={10_000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-2 w-full accent-amber"
            />
          </label>
          <label className="mt-4 block">
            <span className="flex justify-between font-mono text-[11px] uppercase tracking-wide text-ivory-dim">
              <span>Eigenmittel</span>
              <span className="tabular-nums text-ivory">
                {formatChf(effectiveEquity)} ({ratio.toFixed(0)}%)
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={maxEquity}
              step={5_000}
              value={effectiveEquity}
              onChange={(e) => setEquity(Number(e.target.value))}
              className="mt-2 w-full accent-amber"
            />
          </label>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim">Hypothek</span>
            <span className="font-display text-xl font-semibold tabular-nums">{formatChf(mortgage)}</span>
          </div>
          <span
            className={`mt-4 inline-flex rounded-full border px-3 py-1.5 font-mono text-[11px] ${
              ok ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber/30 bg-amber/10 text-amber-soft"
            }`}
          >
            {ok ? "✓ Tragbarkeit im Rahmen" : "⚠ Mind. 20% Eigenmittel empfohlen"}
          </span>
          <p className="mt-3 text-xs leading-relaxed text-ivory-dim">
            Kalkulatorisch ca. <span className="text-ivory">{formatChf((mortgage * 0.05) / 12)} / Monat</span> bei 5% Zins
            (Bankusanz), unabhängig vom Marktzins.
          </p>
        </div>
        <div className="rounded-2xl border border-amber/25 bg-amber/5 p-5 text-sm leading-relaxed text-ivory-dim">
          <div className="font-display text-lg font-semibold text-ivory">Hypocasa</div>
          <p className="mt-1">Hypothekenberatung &amp; Finanzierungsvermittlung, unser Partner für Finanzierungsfragen.</p>
          <a
            href="https://hypocasa.ch"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block border-b border-current pb-0.5 font-mono text-xs uppercase tracking-wide text-amber-soft hover:text-amber"
          >
            Jetzt Finanzierung vergleichen →
          </a>
        </div>
      </div>
    </>
  );
}

const COVERAGES = ["Gebäude", "Hausrat", "Haftpflicht", "Rechtsschutz", "Naturgefahren"];

function VersicherungPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      <Question>Jetzt ist Ihr Zuhause komplett.</Question>
      <Lede>Beim Kauf, Umbau oder Besitz entstehen neue Risiken. Wir prüfen, was Ihr Zuhause wirklich braucht.</Lede>
      <div className="mt-6 flex flex-col items-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-amber bg-[radial-gradient(circle_at_40%_30%,var(--color-ink-2),var(--color-ink))] text-amber-soft shadow-[0_0_30px_-6px_rgba(143,106,57,0.28)]">
          <ShieldCheck className="h-10 w-10" strokeWidth={1.5} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {COVERAGES.map((c) => (
            <span key={c} className="rounded-full border border-line px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <Callout title="Unabhängig:">Vermittlung an ausgewählte Partner, passend zu Ihrer Situation und nicht zu einem Standardpaket.</Callout>
      </div>
      <CtaLink label="Versicherung besprechen" onNavigate={onNavigate} />
    </>
  );
}

export function AreaPanel({ id, onNavigate }: { id: AreaId; onNavigate: () => void }) {
  switch (id) {
    case "kv":
      return <KaufVerkaufPanel onNavigate={onNavigate} />;
    case "umbau":
      return <UmbauPanel onNavigate={onNavigate} />;
    case "fin":
      return <FinanzierungPanel />;
    case "vers":
      return <VersicherungPanel onNavigate={onNavigate} />;
  }
}
