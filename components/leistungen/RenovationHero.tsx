"use client";

import { useRef } from "react";
import { Block, iso, pts } from "@/components/leistungen/iso";
import { useScrollProgress } from "@/lib/useScrollProgress";

const HX = 10;
const HY = 7;
const EAVE = 6;
const RIDGE = 8.6;
const O = 0.45; // Dachüberstand

const STEPS = [
  { at: 0.0, title: "Bestandsaufnahme", text: "Wir schauen das Haus mit Ihnen an: Was ist alt, wo geht Energie verloren, was wünschen Sie sich?" },
  { at: 0.14, title: "Fassade & Dämmung", text: "Die Gebäudehülle ist der grösste Hebel. Dafür gibt es oft Förderbeiträge von Bund und Kanton." },
  { at: 0.32, title: "Neue Fenster", text: "Weniger Wärmeverlust, mehr Ruhe. Meist in wenigen Tagen eingebaut, auch im bewohnten Haus." },
  { at: 0.48, title: "Wärmepumpe statt Öl", text: "Der Öltank kommt raus, die Wärmepumpe rein. Den Heizungsersatz fördern viele Kantone." },
  { at: 0.64, title: "Dach & Solar", text: "Dach dämmen und auf Wunsch eigener Strom vom Dach, optional mit Batterie." },
  { at: 0.82, title: "Fertig und mehr wert", text: "Tiefere Nebenkosten, ein besserer GEAK und ein höherer Wert Ihrer Immobilie." },
];

// GEAK-Klassen A (beste) bis G, Farben wie auf der Energieetikette
const GEAK = [
  { k: "A", c: "#1f8a3b" },
  { k: "B", c: "#5daa3a" },
  { k: "C", c: "#b5c934" },
  { k: "D", c: "#efd334" },
  { k: "E", c: "#f2a531" },
  { k: "F", c: "#e8692b" },
  { k: "G", c: "#d63b2b" },
];
// Klasse je Schritt: F, E, D, C, B, B
const GEAK_AT_STEP = [5, 4, 3, 2, 1, 1];

function hex(c: string) {
  return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
}
/** Farbe zwischen alt (t=0) und neu (t=1). */
function mix(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}

type P3 = [number, number, number];

// Fenster auf der linken Front (y = HY) und der rechten Seite (x = HX)
const WIN_FRONT = [
  { x: 1, z: 0.9, w: 2.2, h: 1.6 },
  { x: 4.2, z: 0, w: 1.4, h: 2.3 },
  { x: 6.6, z: 0.9, w: 2.4, h: 1.6 },
  { x: 1, z: 3.9, w: 1.8, h: 1.4 },
  { x: 4.1, z: 3.9, w: 1.8, h: 1.4 },
  { x: 7.2, z: 3.9, w: 1.8, h: 1.4 },
];
const WIN_SIDE = [
  { y: 1.2, z: 0.9, w: 1.8, h: 1.6 },
  { y: 4.2, z: 0.9, w: 1.8, h: 1.6 },
  { y: 2.6, z: 3.9, w: 1.8, h: 1.4 },
];

/**
 * Umbau statt Neubau: Ein bestehendes, älteres Haus wird beim Scrollen
 * Schritt für Schritt saniert. Fassade, Fenster, Heizung und Dach werden
 * erneuert, die GEAK-Klasse steigt von F auf B.
 */
export function RenovationHero() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(wrap);

  const layer = (start: number, span = 0.12) => Math.min(1, Math.max(0, (progress - start) / span));
  const active = STEPS.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);

  const markers = 1 - layer(0.1, 0.06);
  const facade = layer(0.16, 0.14);
  const windows = layer(0.34);
  const heating = layer(0.5);
  const roof = layer(0.66);
  const solar = layer(0.74, 0.08);
  const garden = layer(0.84);

  // Fassade wächst von unten nach oben über die alte
  const fh = EAVE * facade;
  const geak = GEAK_AT_STEP[active];

  const marker = (p: P3, key: string) => {
    const [cx, cy] = iso(...p);
    return (
      <g key={key} opacity={markers}>
        <circle cx={cx} cy={cy} r="16" fill="none" stroke="#c0392b" strokeWidth="2" className="motion-safe:animate-pulse" />
        <circle cx={cx} cy={cy} r="4" fill="#c0392b" />
      </g>
    );
  };

  return (
    <section ref={wrap} className="relative mx-auto max-w-7xl px-4 lg:px-10" style={{ height: "260vh" }}>
      <div className="sticky top-20 grid h-[calc(100svh-6rem)] items-center gap-6 overflow-hidden rounded-[28px] border border-line bg-white p-5 sm:p-8 lg:grid-cols-[1fr_340px]">
        <svg viewBox="-300 -250 640 560" className="h-full max-h-[52svh] w-full lg:max-h-none" role="img" aria-label="Ein älteres Haus wird Schritt für Schritt saniert">
          {/* Grundstück */}
          <polygon points={pts([-2.5, -2, -0.6], [13.5, -2, -0.6], [13.5, 10, -0.6], [-2.5, 10, -0.6])} fill={mix("#e4e1d6", "#eef0e6", garden)} stroke="#191b1d" strokeOpacity="0.1" />

          {/* Sockel und altes Haus */}
          <Block b={{ x: -0.2, y: -0.2, z: -0.6, dx: HX + 0.4, dy: HY + 0.4, dz: 0.6 }} top="#cfcac1" right="#a9a399" left="#bab4aa" />
          <Block b={{ x: 0, y: 0, z: 0, dx: HX, dy: HY, dz: EAVE }} top="#d6d0c4" right="#b9b2a5" left="#c9c2b5" />
          {/* Risse und Flecken in der alten Fassade */}
          <g opacity={1 - facade} stroke="#8b8478" strokeWidth="1" fill="none">
            <polyline points={pts([2.4, HY + 0.02, 2.4], [2.8, HY + 0.02, 2.0], [2.6, HY + 0.02, 1.6])} />
            <polyline points={pts([8.4, HY + 0.02, 5.4], [8.0, HY + 0.02, 4.9], [8.3, HY + 0.02, 4.4])} />
            <polyline points={pts([HX + 0.02, 5.6, 2.8], [HX + 0.02, 6.1, 2.2])} />
          </g>

          {/* Neue, gedämmte Fassade wächst darüber */}
          {fh > 0.01 && (
            <g stroke="#191b1d" strokeOpacity="0.18" strokeWidth="0.8" strokeLinejoin="round">
              <polygon points={pts([HX + 0.12, -0.12, 0], [HX + 0.12, HY + 0.12, 0], [HX + 0.12, HY + 0.12, fh], [HX + 0.12, -0.12, fh])} fill="#e3dacb" />
              <polygon points={pts([-0.12, HY + 0.12, 0], [HX + 0.12, HY + 0.12, 0], [HX + 0.12, HY + 0.12, fh], [-0.12, HY + 0.12, fh])} fill="#f4efe5" />
              {facade < 1 && (
                <polyline
                  points={pts([-0.12, HY + 0.12, fh], [HX + 0.12, HY + 0.12, fh], [HX + 0.12, -0.12, fh])}
                  fill="none"
                  stroke="#8f6a39"
                  strokeOpacity="0.9"
                  strokeWidth="2.5"
                />
              )}
            </g>
          )}
          {/* Geschossband */}
          <polygon points={pts([-0.12, HY + 0.14, 2.95], [HX + 0.12, HY + 0.14, 2.95], [HX + 0.12, HY + 0.14, 3.1], [-0.12, HY + 0.14, 3.1])} fill={mix("#a69e90", "#c8bfae", facade)} />

          {/* Fenster: alte dunkle Rahmen, dann neue */}
          {WIN_FRONT.map((w) => {
            const y = HY + 0.16;
            return (
              <g key={`f${w.x}-${w.z}`}>
                <polygon points={pts([w.x, y, w.z], [w.x + w.w, y, w.z], [w.x + w.w, y, w.z + w.h], [w.x, y, w.z + w.h])} fill="#5d5247" stroke="#3d342b" strokeWidth="1.5" />
                <polygon
                  points={pts([w.x, y + 0.01, w.z], [w.x + w.w, y + 0.01, w.z], [w.x + w.w, y + 0.01, w.z + w.h], [w.x, y + 0.01, w.z + w.h])}
                  fill="#9db4c8"
                  stroke="#4f6b84"
                  strokeWidth="1"
                  opacity={windows}
                />
              </g>
            );
          })}
          {WIN_SIDE.map((w) => {
            const x = HX + 0.16;
            return (
              <g key={`s${w.y}-${w.z}`}>
                <polygon points={pts([x, w.y, w.z], [x, w.y + w.w, w.z], [x, w.y + w.w, w.z + w.h], [x, w.y, w.z + w.h])} fill="#544a40" stroke="#3d342b" strokeWidth="1.5" />
                <polygon
                  points={pts([x + 0.01, w.y, w.z], [x + 0.01, w.y + w.w, w.z], [x + 0.01, w.y + w.w, w.z + w.h], [x + 0.01, w.y, w.z + w.h])}
                  fill="#b7c9d8"
                  stroke="#4f6b84"
                  strokeWidth="1"
                  opacity={windows}
                />
              </g>
            );
          })}

          {/* Dach: alt grau, neu warm */}
          <g stroke="#191b1d" strokeOpacity="0.2" strokeWidth="0.8" strokeLinejoin="round">
            <polygon points={pts([-O, HY / 2, RIDGE], [HX + O, HY / 2, RIDGE], [HX + O, -O, EAVE], [-O, -O, EAVE])} fill={mix("#4d4d4b", "#6f5230", roof)} />
            <polygon points={pts([HX + 0.12, -0.01, EAVE], [HX + 0.12, HY + 0.01, EAVE], [HX + 0.12, HY / 2, RIDGE])} fill={mix("#c4bdb0", "#e2dacb", facade)} />
            <polygon points={pts([-O, HY + O, EAVE], [HX + O, HY + O, EAVE], [HX + O, HY / 2, RIDGE], [-O, HY / 2, RIDGE])} fill={mix("#5f5f5c", "#8f6a39", roof)} />
          </g>
          {/* Kamin mit Rauch, verschwindet mit der Wärmepumpe */}
          <g opacity={1 - heating}>
            <Block b={{ x: 7.4, y: 2.2, z: 7.2, dx: 0.7, dy: 0.7, dz: 1.9 }} top="#6b6157" right="#5a5148" left="#7a7066" />
            {[0, 1, 2].map((i) => {
              const [cx, cy] = iso(7.75, 2.55, 9.5 + i * 0.9);
              return <circle key={i} cx={cx + i * 6} cy={cy} r={7 + i * 3} fill="#9a958c" opacity={0.45 - i * 0.12} />;
            })}
          </g>
          {/* Solar */}
          <g opacity={solar}>
            {[0, 1, 2, 3].map((i) => {
              const x0 = 1 + i * 2.1;
              const at = (x: number, t: number) => [x, HY + O - t * (HY / 2 + O), EAVE + t * (RIDGE - EAVE)] as P3;
              return <polygon key={i} points={pts(at(x0, 0.18), at(x0 + 1.8, 0.18), at(x0 + 1.8, 0.78), at(x0, 0.78))} fill="#25344a" stroke="#9db4c8" strokeWidth="0.8" />;
            })}
          </g>

          {/* Öltank raus, Wärmepumpe rein (rechts neben dem Haus) */}
          <g opacity={1 - heating}>
            <Block b={{ x: HX + 0.9, y: 4.6, z: -0.6, dx: 1.6, dy: 1.6, dz: 1.2 }} top="#a88a68" right="#8c6f50" left="#9a7b5a" />
          </g>
          <g opacity={heating} style={{ transform: `translateY(${(1 - heating) * -30}px)` }}>
            <Block b={{ x: HX + 0.9, y: 4.6, z: -0.6, dx: 1.2, dy: 1.8, dz: 1.3 }} top="#f3f3f1" right="#d7d9da" left="#e7e9ea" />
            {(() => {
              const [cx, cy] = iso(HX + 1.5, 6.4, 0.05);
              return <circle cx={cx} cy={cy} r="9" fill="#4f6b84" fillOpacity="0.35" stroke="#4f6b84" strokeWidth="1.2" />;
            })()}
          </g>

          {/* Garten zum Schluss */}
          <g opacity={garden}>
            {[
              [12.6, 0.8],
              [-1.6, 8.6],
              [12.9, 8.2],
            ].map(([x, y]) => {
              const [cx, cy] = iso(x, y, -0.6);
              return (
                <g key={`${x}-${y}`}>
                  <rect x={cx - 2} y={cy - 26} width="4" height="26" fill="#7a5a36" />
                  <circle cx={cx} cy={cy - 40} r="20" fill="#8aa37a" />
                </g>
              );
            })}
            <polygon points={pts([4.2, HY + 0.2, -0.58], [5.6, HY + 0.2, -0.58], [5.6, 9.8, -0.58], [4.2, 9.8, -0.58])} fill="#d8d0c2" />
          </g>

          {/* Schwachstellen bei der Bestandsaufnahme */}
          {[
            marker([2.1, HY + 0.2, 1.7], "win"),
            marker([5.0, HY / 2 + 1.6, RIDGE - 0.6], "roof"),
            marker([HX + 1.7, 5.4, 0.6], "tank"),
            marker([HX + 0.2, 1.4, 3.6], "wall"),
          ]}
        </svg>

        <div>
          {/* GEAK-Skala: Klasse verbessert sich mit jedem Schritt */}
          <div className="mb-4 rounded-xl border border-line p-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ivory-dim">Energieklasse (GEAK)</span>
              <span className="font-display text-lg text-ivory">
                {geak === 5 ? "heute " : `${GEAK[5].k} → `}
                <span style={{ color: GEAK[geak].c }}>{GEAK[geak].k}</span>
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {GEAK.map((g, i) => (
                <span
                  key={g.k}
                  className="flex h-6 flex-1 items-center justify-center rounded text-[11px] font-semibold text-white transition-all duration-500"
                  style={{ background: g.c, opacity: i === geak ? 1 : 0.3, transform: i === geak ? "scaleY(1.25)" : "none" }}
                >
                  {g.k}
                </span>
              ))}
            </div>
          </div>

          <ol className="grid gap-2">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={`rounded-xl border p-3 transition-colors ${i === active ? "border-amber bg-amber/10" : "hidden border-transparent lg:block"} ${i > active ? "opacity-45" : ""}`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-lg text-amber">{i + 1}</span>
                  <span className="font-display text-lg text-ivory">{s.title}</span>
                </div>
                {i === active && <p className="mt-1 text-sm leading-relaxed text-ivory-dim">{s.text}</p>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
