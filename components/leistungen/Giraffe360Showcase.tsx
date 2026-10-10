"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, LayoutGrid, Rotate3d, Sofa, Plane, Users } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

// Optional: Link auf einen echten Giraffe360-Beispielrundgang (Vercel-Variable).
const DEMO_TOUR = process.env.NEXT_PUBLIC_GIRAFFE_DEMO_URL;

const TABS = [
  { id: "foto", label: "Profi-Fotos", icon: Camera },
  { id: "plan", label: "Grundriss", icon: LayoutGrid },
  { id: "tour", label: "360°-Rundgang", icon: Rotate3d },
] as const;

type TabId = (typeof TABS)[number]["id"];

function FloorPlan() {
  // Schematischer Beispiel-Grundriss im Stil der Giraffe360-Pläne.
  const wall = { stroke: "var(--color-ivory)", strokeWidth: 6, fill: "none", strokeLinecap: "square" as const };
  const thin = { stroke: "var(--color-ivory)", strokeWidth: 2, fill: "none" };
  const label = "font-sans";
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" role="img" aria-label="Beispiel-Grundriss einer 5.5-Zimmer-Wohnung">
      <rect x="0" y="0" width="800" height="500" fill="#fff" />
      <rect x="560" y="40" width="200" height="420" fill="var(--color-ink-2)" />
      {/* Aussenwände */}
      <path d="M40 40 H560 V460 H40 Z" {...wall} />
      {/* Innenwände */}
      <path d="M40 250 H200 M260 250 H330 M330 40 V180 M330 230 V460 M200 250 V460 M330 330 H420 M470 330 H560 M420 330 V460" {...wall} />
      {/* Türbögen */}
      <path d="M200 250 A60 60 0 0 1 260 190" {...thin} />
      <path d="M330 180 A50 50 0 0 1 380 230" {...thin} />
      <path d="M420 330 A50 50 0 0 0 470 280" {...thin} />
      {/* Fensterfront zur Terrasse */}
      <path d="M560 90 V410" stroke="#fff" strokeWidth="6" />
      <path d="M556 90 V410 M564 90 V410" {...thin} />
      {/* Kücheninsel */}
      <rect x="400" y="90" width="110" height="40" {...thin} />
      <g className={label} fill="var(--color-ivory)" fontSize="18" textAnchor="middle">
        <text x="185" y="150">Zimmer 1</text>
        <text x="445" y="200">Wohnen / Essen</text>
        <text x="455" y="115" fontSize="13" fill="var(--color-ivory-dim)">Küche</text>
        <text x="120" y="360">Zimmer 2</text>
        <text x="265" y="360">Zimmer 3</text>
        <text x="375" y="400">Bad</text>
        <text x="515" y="400">Dusche</text>
        <text x="660" y="250">Terrasse</text>
      </g>
      <g fill="var(--color-ivory-dim)" fontSize="13" textAnchor="middle" className={label}>
        <text x="300" y="490">Massstabsgetreu · Flächen pro Raum · 2D und 3D</text>
      </g>
    </svg>
  );
}

const STEPS = [
  { title: "Termin vor Ort", text: "Wir gehen mit Ihnen die Checkliste durch: aufräumen, Licht an, Vorhänge auf. Mehr braucht es nicht." },
  { title: "Aufnahme mit Giraffe360", text: "Die Kamera steht auf einem Stativ und dreht sich selbst. Pro Raum ein paar Positionen, Sie müssen nichts tun." },
  { title: "In wenigen Tagen online", text: "Fotos, Grundriss, 3D-Rundgang und Drohnenflug erscheinen auf der Objektseite, den Portalen und im Exposé." },
];

const BENEFITS = [
  { icon: Users, title: "Weniger Besichtigungstouristen", text: "Käufer kennen jeden Raum schon vorher. Wer kommt, ist ernsthaft interessiert." },
  { icon: Rotate3d, title: "Rund um die Uhr besichtigt", text: "Der Rundgang läuft auch abends, am Wochenende und für Käufer aus dem Ausland." },
  { icon: Sofa, title: "Käufer richten sich ein", text: "Der Grundriss kommt in unseren Planer. Interessenten stellen ihre Möbel hinein und verlieben sich." },
  { icon: Plane, title: "Auffallen auf den Portalen", text: "Profi-Bilder und Drohnenflug heben Ihr Inserat ab und bringen mehr Klicks." },
];

export function Giraffe360Showcase() {
  const [tab, setTab] = useState<TabId>("foto");

  return (
    <section id="giraffe360" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 lg:px-10">
      <SectionLabel>Vermarktung mit Giraffe360</SectionLabel>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center">
        <div>
          <h2 className="font-display text-3xl text-ivory lg:text-5xl">
            Ein Termin. <em>Alles im Kasten.</em>
          </h2>
          <p className="mt-5 text-lg text-ivory-dim">
            Giraffe360 ist eine intelligente Kamera, die Ihr Zuhause in einem einzigen Termin komplett erfasst. Daraus entstehen
            Profi-Fotos, ein massstabsgetreuer Grundriss und ein virtueller Rundgang, durch den Interessenten Raum für Raum gehen.
          </p>
          <ul className="mt-6 space-y-3 text-ivory">
            <li>✓ Fotos in High-End-Qualität, Fenster und Räume perfekt belichtet</li>
            <li>✓ Grundrisse in 2D und 3D mit Flächen pro Raum</li>
            <li>✓ 360°-Rundgang rund um die Uhr, auch vom Ausland aus</li>
            <li>✓ In der Provision inbegriffen</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-2" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors ${
                  tab === t.id ? "border-night bg-night text-ink" : "border-line bg-white text-ivory hover:border-ivory"
                }`}
              >
                <t.icon className="h-4 w-4" strokeWidth={1.5} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_80px_-30px_rgba(41,37,27,0.35)]">
          {tab === "foto" && (
            <Image src="/images/novidom-holzhaus.webp" alt="Beispiel für ein Profi-Foto" fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
          )}
          {tab === "plan" && (
            <div className="absolute inset-0 p-4">
              <FloorPlan />
            </div>
          )}
          {tab === "tour" && (
            <>
              <Image src="/images/novidom-holzhaus.webp" alt="" fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover object-[30%_center]" />
              {/* Rundgang-Punkte wie im echten Viewer */}
              {[
                [28, 72],
                [52, 66],
                [70, 74],
              ].map(([left, top]) => (
                <span
                  key={`${left}-${top}`}
                  aria-hidden
                  className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/30 backdrop-blur-sm motion-safe:animate-pulse"
                  style={{ left: `${left}%`, top: `${top}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                {DEMO_TOUR ? (
                  <a
                    href={DEMO_TOUR}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-night shadow-lg transition-colors hover:bg-white"
                  >
                    Beispiel-Rundgang starten →
                  </a>
                ) : (
                  <span className="rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-night shadow-lg">
                    360° · Raum für Raum erleben
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="font-display text-2xl text-ivory lg:text-3xl">So läuft es ab</h3>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-line pt-5">
              <span className="font-display text-3xl text-amber">{i + 1}</span>
              <div className="mt-2 font-display text-xl text-ivory">{step.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-ivory-dim">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16">
        <h3 className="font-display text-2xl text-ivory lg:text-3xl">Was das für Ihren Verkauf bringt</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-line bg-white p-6">
              <b.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
              <div className="mt-4 font-display text-lg text-ivory">{b.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{b.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/leistungen/kaufen-verkaufen#kontakt" className="rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink hover:bg-amber">
            Gratis-Bewertung mit Giraffe360-Beratung
          </Link>
          <Link href="/expose-beispiel" className="rounded-full border border-line px-7 py-4 text-sm font-semibold text-ivory hover:border-ivory">
            Beispiel-Exposé ansehen
          </Link>
        </div>
      </div>
    </section>
  );
}
