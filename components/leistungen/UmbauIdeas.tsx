"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RUNDGANG_PLAN as PLAN, roomArea } from "@/lib/floorplan";

const IDEAS = [
  { key: "kueche", title: "Küche öffnen, Insel ins Zentrum", text: "Die Wand zur Küche fällt, die Insel rückt zum Wohnbereich. Wer kocht, ist mitten im Leben.", cost: "ca. CHF 35'000 – 60'000" },
  { key: "bad", title: "Wanne raus, bodenebene Dusche", text: "Mehr Platz, leichter zu putzen und altersgerecht. Oft in zwei bis drei Wochen gemacht.", cost: "ca. CHF 12'000 – 20'000" },
  { key: "balkon", title: "Balkon als Aussenzimmer", text: "Sichtschutz, Licht, Lounge und Pflanzen. Eine Verglasung braucht meist eine Bewilligung.", cost: "ab CHF 3'000, Verglasung ab CHF 15'000" },
] as const;

const ISLAND_BEFORE = { x: 90, y: 1190 };
const ISLAND_AFTER = { x: 330, y: 1000 };

/**
 * Umbau-Ideen am echten Grundriss: Vorher/Nachher mit Animation. Zeigt, was
 * wir mit Kunden besprechen, bevor die erste Offerte eingeholt wird.
 */
export function UmbauIdeas() {
  const [after, setAfter] = useState(false);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setAfter((a) => !a), 3200);
    return () => clearInterval(t);
  }, [auto]);

  function choose(value: boolean) {
    setAuto(false);
    setAfter(value);
  }

  const ease = "transform 900ms cubic-bezier(.65,0,.35,1), opacity 700ms";
  const kitchen = PLAN.rooms.find((r) => r.name === "Küche")!;
  const living = PLAN.rooms.find((r) => r.name === "Wohnen / Essen")!;
  const pad = 30;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-blueprint">Umbau-Ideen am Grundriss</div>
      <h2 className="mb-3 mt-6 font-display text-3xl text-ivory lg:text-4xl">
        Aus einer guten Wohnung <em>wird Ihre Wohnung.</em>
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ivory-dim">
        Ein Beispiel an einer 3.5-Zimmer-Wohnung: Was würden wir ändern, was kostet es, was bringt es? So besprechen wir jeden Umbau, bevor wir Offerten einholen.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex gap-2 border-b border-line p-3" role="tablist">
            {[
              [false, "Heute"],
              [true, "Nach dem Umbau"],
            ].map(([value, label]) => (
              <button
                key={String(label)}
                type="button"
                role="tab"
                aria-selected={after === value}
                onClick={() => choose(value as boolean)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${after === value ? "bg-night text-ink" : "text-ivory-dim hover:text-ivory"}`}
              >
                {label as string}
              </button>
            ))}
          </div>
          <svg viewBox={`${-pad} ${780 - pad} ${PLAN.width + pad * 2} ${PLAN.height - 780 + pad * 2}`} className="block h-auto w-full" role="img" aria-label={after ? "Grundriss nach dem Umbau" : "Grundriss heute"}>
            <defs>
              <pattern id="ideas-deck" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="24" stroke="#d9d2c5" strokeWidth="6" />
              </pattern>
            </defs>
            {PLAN.rooms
              .filter((r) => r.y >= 780 || r.name === "Reduit")
              .map((r) => (
                <rect
                  key={r.name}
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={r.outdoor ? "url(#ideas-deck)" : "#fbfaf7"}
                  stroke="#191b1d"
                  strokeWidth={r.outdoor ? 3 : 10}
                  strokeDasharray={r.outdoor ? "14 10" : undefined}
                />
              ))}
            {/* Wand zwischen Küche und Wohnen: fällt beim Umbau */}
            <rect x={kitchen.x + kitchen.w - 6} y={kitchen.y + 6} width={living.x - kitchen.x - kitchen.w + 12} height={kitchen.h - 12} fill="#fbfaf7" style={{ opacity: after ? 1 : 0, transition: ease }} />
            <text x={after ? 560 : 635} y={after ? 1205 : 1150} textAnchor="middle" fontSize="30" fontWeight="600" fill="#191b1d" style={{ transition: ease }}>
              {after ? "Wohnen / Küche / Essen" : "Wohnen / Essen"}
            </text>
            <text x={after ? 560 : 635} y={after ? 1236 : 1186} textAnchor="middle" fontSize="24" fill="#5f6b78">
              ca. {(roomArea(living) + (after ? roomArea(kitchen) : 0)).toFixed(0)} m²
            </text>
            {!after && (
              <text x={kitchen.x + kitchen.w / 2} y={kitchen.y + 70} textAnchor="middle" fontSize="26" fill="#191b1d">
                Küche
              </text>
            )}
            <text x={110} y={900} textAnchor="middle" fontSize="24" fill="#191b1d">
              Reduit
            </text>

            {/* Küchenzeile bleibt, die Insel wandert ins Zentrum */}
            <rect x="20" y="1000" width="50" height="240" rx="6" fill="#e9e3d8" stroke="#9aa3ad" strokeWidth="3" />
            <g style={{ transform: `translate(${after ? ISLAND_AFTER.x - ISLAND_BEFORE.x : 0}px, ${after ? ISLAND_AFTER.y - ISLAND_BEFORE.y : 0}px)`, transition: ease }}>
              <rect x={ISLAND_BEFORE.x} y={ISLAND_BEFORE.y} width={after ? 240 : 150} height={after ? 90 : 50} rx="8" fill={after ? "#8f6a39" : "#e9e3d8"} fillOpacity={after ? 0.25 : 1} stroke={after ? "#8f6a39" : "#9aa3ad"} strokeWidth="3" style={{ transition: "all 900ms" }} />
              <text x={ISLAND_BEFORE.x + (after ? 120 : 75)} y={ISLAND_BEFORE.y + (after ? 54 : 34)} textAnchor="middle" fontSize="22" fill="#191b1d">
                Insel
              </text>
            </g>
            {/* Barhocker an der neuen Insel */}
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={ISLAND_AFTER.x + 50 + i * 70} cy={ISLAND_AFTER.y + 125} r="18" fill="#c8bfae" style={{ opacity: after ? 1 : 0, transition: ease }} />
            ))}
            {/* Balkon wird zum Aussenzimmer */}
            <g style={{ opacity: after ? 1 : 0, transition: ease }}>
              <rect x="80" y="1330" width="260" height="95" rx="18" fill="#c8bfae" />
              <rect x="150" y="1450" width="120" height="70" rx="10" fill="#e9e3d8" stroke="#9aa3ad" strokeWidth="3" />
              {[620, 700, 780, 900].map((x) => (
                <circle key={x} cx={x} cy={1320} r="26" fill="#8aa37a" />
              ))}
              <text x="640" y="1470" textAnchor="middle" fontSize="24" fill="#191b1d">
                Lounge, Licht, Sichtschutz
              </text>
            </g>
            {!after && (
              <text x="510" y="1440" textAnchor="middle" fontSize="28" fill="#191b1d">
                Balkon
              </text>
            )}
          </svg>
          <div className="border-t border-line p-3 text-xs text-ivory-dim">Ausschnitt: Wohnbereich, Küche und Balkon. Richtwerte inkl. MwSt., abhängig von Objekt und Ausbau.</div>
        </div>

        <div className="grid gap-3">
          {IDEAS.map((idea, i) => (
            <div key={idea.key} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl text-amber">{i + 1}</span>
                <span className="font-display text-xl text-ivory">{idea.title}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ivory-dim">{idea.text}</p>
              <div className="mt-2 font-mono text-xs tracking-[0.06em] text-amber">{idea.cost}</div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Link href="/rundgang" className="rounded-full bg-night px-5 py-3 text-sm font-semibold text-ink hover:bg-amber">
              Selbst im Grundriss ausprobieren
            </Link>
            <a href="#kontakt" className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ivory hover:border-ivory">
              Umbau besprechen
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
