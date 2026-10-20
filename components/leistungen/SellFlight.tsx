"use client";

import { useRef } from "react";
import { Block, iso, pts } from "@/components/leistungen/iso";
import { useScrollProgress } from "@/lib/useScrollProgress";

const STEPS = [
  { at: 0, title: "Bewerten", text: "Bankanerkannter Marktwert und eine ehrliche Preisstrategie, bevor irgendetwas online geht." },
  { at: 0.2, title: "Inszenieren", text: "Profi-Fotos, Drohne, 3D-Rundgang und Grundriss. Ihr Haus von seiner besten Seite." },
  { at: 0.42, title: "Vermarkten", text: "48 Stunden Off-Market für unsere Käuferkartei, danach die grossen Portale und Social Media." },
  { at: 0.62, title: "Besichtigen", text: "Nur geprüfte Interessenten mit Finanzierungsnachweis. Wir führen die Besichtigungen." },
  { at: 0.82, title: "Verkaufen", text: "Verhandlung, Kaufvertrag und Notar. Am Ende übergeben wir den Schlüssel." },
];

const CHANNELS = ["Off-Market 48h", "Käuferkartei", "Homegate", "ImmoScout24", "Instagram"];

// Das Objekt in der Mitte des Quartiers, in Rastereinheiten
const H = { x: 5.5, y: 5.5, dx: 3, dy: 2.4, eave: 2, ridge: 3.2 };
const NEIGHBOURS = [
  { x: 1, y: 1.2, dx: 2.2, dy: 2, dz: 1.6 },
  { x: 9.6, y: 1.4, dx: 2.4, dy: 1.8, dz: 2.4 },
  { x: 1.2, y: 9.4, dx: 2, dy: 2.2, dz: 2 },
  { x: 10, y: 9.8, dx: 2.2, dy: 2, dz: 1.4 },
  { x: 5.8, y: 1, dx: 2, dy: 1.6, dz: 1.8 },
  { x: 1, y: 5.6, dx: 1.8, dy: 2, dz: 1.5 },
];
// Startpunkte der Interessenten am Rand
const BUYERS: [number, number][] = [
  [0, 3.5],
  [13, 4],
  [3.5, 13],
  [12.5, 12],
  [7, 0],
  [0, 12],
];

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
// Sinus/Cosinus gerundet, damit Server und Browser dieselben Attribute schreiben
const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Verkaufen als Flug übers Quartier: Beim Scrollen wird das Haus bewertet,
 * von der Drohne umkreist, vermarktet, besichtigt und verkauft.
 */
export function SellFlight() {
  const wrap = useRef<HTMLElement>(null);
  const progress = useScrollProgress(wrap);
  const stage = (start: number, span = 0.16) => clamp((progress - start) / span);
  const active = STEPS.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);

  const value = ease(stage(0.02, 0.15));
  const drone = stage(0.2, 0.22);
  const signal = stage(0.42, 0.18);
  const visit = ease(stage(0.62, 0.18));
  const sold = ease(stage(0.84, 0.1));

  const cx = H.x + H.dx / 2;
  const cy = H.y + H.dy / 2;
  const [hx, hy] = iso(cx, cy, H.ridge + 0.6);
  // Kamera: zoomt beim Einstieg aufs Haus und beim Verkauf wieder etwas zurück
  const zoom = 1 + 0.35 * ease(stage(0, 0.2)) - 0.15 * sold;

  // Drohne kreist ums Haus, solange gescrollt wird
  const angle = drone * Math.PI * 2.4 - Math.PI / 2;
  const [dxp, dyp] = iso(cx + r2(Math.cos(angle) * 3.4), cy + r2(Math.sin(angle) * 3.4), 4.2);
  const flash = drone > 0 && drone < 1 ? (Math.sin(drone * Math.PI * 10) > 0.85 ? 1 : 0) : 0;

  return (
    <section ref={wrap} className="relative mx-auto max-w-7xl px-4 lg:px-10" style={{ height: "300vh" }}>
      <div className="sticky top-20 grid h-[calc(100svh-6rem)] content-center items-center gap-6 overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-[#f3efe7] via-white to-[#eef2f6] p-5 sm:p-8 lg:grid-cols-[1fr_340px]">
        <svg viewBox="-330 -60 660 470" className="h-auto max-h-[58svh] w-full lg:h-full lg:max-h-none" role="img" aria-label="Ein Haus wird bewertet, von einer Drohne aufgenommen, vermarktet, besichtigt und verkauft">
          <g style={{ transform: `scale(${zoom})`, transformOrigin: `${hx}px ${hy + 60}px`, transition: "transform 120ms linear" }}>
            {/* Quartier mit Strassen */}
            <polygon points={pts([0, 0, 0], [13, 0, 0], [13, 13, 0], [0, 13, 0])} fill="#e9ecdf" stroke="#191b1d" strokeOpacity="0.08" />
            <polygon points={pts([4.2, 0, 0.01], [4.9, 0, 0.01], [4.9, 13, 0.01], [4.2, 13, 0.01])} fill="#dedad1" />
            <polygon points={pts([0, 8.6, 0.01], [13, 8.6, 0.01], [13, 9.3, 0.01], [0, 9.3, 0.01])} fill="#dedad1" />
            {NEIGHBOURS.map((n) => (
              <Block key={`${n.x}-${n.y}`} b={{ ...n, z: 0 }} top="#e4e2dc" right="#cfccc4" left="#dbd8d0" />
            ))}

            {/* Signalwellen beim Vermarkten */}
            {signal > 0 &&
              [0, 1, 2].map((i) => {
                const r = ((signal * 3 + i / 3) % 1) * 230;
                return <circle key={i} cx={hx} cy={hy + 30} r={r} fill="none" stroke="#8f6a39" strokeWidth="1.5" opacity={(1 - r / 230) * 0.6} />;
              })}

            {/* Das Objekt */}
            <polygon points={pts([H.x - 0.6, H.y - 0.6, 0.02], [H.x + H.dx + 0.6, H.y - 0.6, 0.02], [H.x + H.dx + 0.6, H.y + H.dy + 0.6, 0.02], [H.x - 0.6, H.y + H.dy + 0.6, 0.02])} fill="#d4dfc4" />
            <Block b={{ x: H.x, y: H.y, z: 0, dx: H.dx, dy: H.dy, dz: H.eave }} top="#efe9dd" right="#d9d1c2" left="#f4efe5" />
            <polygon points={pts([H.x + 0.4, H.y + H.dy + 0.01, 0.2], [H.x + 1.2, H.y + H.dy + 0.01, 0.2], [H.x + 1.2, H.y + H.dy + 0.01, 1.4], [H.x + 0.4, H.y + H.dy + 0.01, 1.4])} fill="#9db4c8" stroke="#4f6b84" strokeWidth="1" />
            <polygon points={pts([H.x + 1.8, H.y + H.dy + 0.01, 0.6], [H.x + 2.6, H.y + H.dy + 0.01, 0.6], [H.x + 2.6, H.y + H.dy + 0.01, 1.4], [H.x + 1.8, H.y + H.dy + 0.01, 1.4])} fill="#9db4c8" stroke="#4f6b84" strokeWidth="1" />
            <g stroke="#191b1d" strokeOpacity="0.2" strokeWidth="0.8" strokeLinejoin="round">
              <polygon points={pts([H.x - 0.25, H.y + H.dy / 2, H.ridge], [H.x + H.dx + 0.25, H.y + H.dy / 2, H.ridge], [H.x + H.dx + 0.25, H.y - 0.25, H.eave], [H.x - 0.25, H.y - 0.25, H.eave])} fill="#6f5230" />
              <polygon points={pts([H.x + H.dx, H.y, H.eave], [H.x + H.dx, H.y + H.dy, H.eave], [H.x + H.dx, H.y + H.dy / 2, H.ridge])} fill="#e2dacb" />
              <polygon points={pts([H.x - 0.25, H.y + H.dy + 0.25, H.eave], [H.x + H.dx + 0.25, H.y + H.dy + 0.25, H.eave], [H.x + H.dx + 0.25, H.y + H.dy / 2, H.ridge], [H.x - 0.25, H.y + H.dy / 2, H.ridge])} fill="#8f6a39" />
            </g>

            {/* Bewertungs-Scan */}
            {value > 0 && value < 1 && (
              <polygon
                points={pts([H.x - 0.6, H.y - 0.6, value * 3.6], [H.x + H.dx + 0.6, H.y - 0.6, value * 3.6], [H.x + H.dx + 0.6, H.y + H.dy + 0.6, value * 3.6], [H.x - 0.6, H.y + H.dy + 0.6, value * 3.6])}
                fill="rgba(79,107,132,0.12)"
                stroke="#4f6b84"
                strokeWidth="1.2"
              />
            )}

            {/* Interessenten kommen zur Besichtigung */}
            {visit > 0 &&
              BUYERS.map(([bx, by], i) => {
                const t = clamp(visit * 1.3 - i * 0.06);
                const [px, py] = iso(bx + (cx + (i % 3) * 0.5 - 0.5 - bx) * t, by + (cy + 1.8 - by) * t, 0);
                return (
                  <g key={i} opacity={Math.min(1, visit * 3)} transform={`translate(${r2(px)} ${r2(py)})`}>
                    <ellipse cx="0" cy="0" rx="7" ry="3" fill="#191b1d" opacity="0.12" />
                    <rect x="-4" y="-16" width="8" height="12" rx="4" fill={i % 2 ? "#4f6b84" : "#8f6a39"} />
                    <circle cx="0" cy="-21" r="4.5" fill={i % 2 ? "#4f6b84" : "#8f6a39"} />
                  </g>
                );
              })}

            {/* Drohne */}
            {drone > 0 && (
              <g opacity={drone < 1 ? 1 : 0.0} style={{ transition: "opacity 300ms" }}>
                <ellipse cx={iso(cx, cy, 4.2)[0]} cy={iso(cx, cy, 4.2)[1]} rx={3.4 * 0.866 * 26 * 1.41} ry={3.4 * 0.5 * 26 * 1.41} fill="none" stroke="#4f6b84" strokeOpacity="0.35" strokeDasharray="4 5" />
                <g transform={`translate(${r2(dxp)} ${r2(dyp)}) scale(2)`}>
                  <polygon points={`0,5 ${r2((hx - dxp) / 2 - 14)},${r2((hy - dyp) / 2 + 30)} ${r2((hx - dxp) / 2 + 14)},${r2((hy - dyp) / 2 + 30)}`} fill="#fff1c9" opacity="0.35" />
                  <rect x="-9" y="-3" width="18" height="6" rx="3" fill="#191b1d" />
                  {[-11, 11].map((ox) => (
                    <g key={ox}>
                      <line x1={ox / 2} y1="-1" x2={ox} y2="-4" stroke="#191b1d" strokeWidth="1.5" />
                      <ellipse cx={ox} cy="-4.5" rx="8" ry="1.8" fill="#191b1d" opacity="0.55" />
                    </g>
                  ))}
                  <circle cx="0" cy="4" r="2.6" fill="#4f6b84" />
                  {flash > 0 && <circle cx="0" cy="4" r="7" fill="#fff6d6" opacity="0.6" />}
                </g>
              </g>
            )}

            {/* Marktwert-Schild */}
            <g opacity={Math.min(1, value * 2) * (1 - signal)} transform={`translate(${r2(hx)} ${r2(hy - 34 - value * 10)})`}>
              <rect x="-74" y="-30" width="148" height="44" rx="12" fill="#191b1d" />
              <text x="0" y="-12" textAnchor="middle" fill="#b8955f" fontSize="9" letterSpacing="2" fontFamily="var(--font-mono), monospace">
                MARKTWERT · BEISPIEL
              </text>
              <text x="0" y="7" textAnchor="middle" fill="#faf9f6" fontSize="16" fontFamily="var(--font-display), serif">
                CHF {Math.round(1_450_000 * value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}
              </text>
            </g>

            {/* Kanäle */}
            {CHANNELS.map((c, i) => {
              const t = clamp(signal * 2.2 - i * 0.22);
              const a = (-160 + i * 34) * (Math.PI / 180);
              const x = r2(hx + Math.cos(a) * 210);
              const y = r2(hy + 40 + Math.sin(a) * 120);
              const w = c.length * 6.4 + 22;
              return (
                <g key={c} opacity={t * (1 - visit * 0.7)} transform={`translate(${x} ${r2(y + (1 - t) * 12)})`}>
                  <rect x={-w / 2} y="-12" width={w} height="24" rx="12" fill="#ffffff" stroke="#8f6a39" strokeOpacity="0.5" />
                  <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#191b1d" fontFamily="var(--font-sans), sans-serif">
                    {c}
                  </text>
                </g>
              );
            })}

            {/* Verkauft */}
            {sold > 0 && (
              <g opacity={sold} transform={`translate(${hx} ${hy + 70}) rotate(-12) scale(${2 - sold})`}>
                <rect x="-92" y="-26" width="184" height="52" rx="8" fill="rgba(250,249,246,0.92)" stroke="#8f6a39" strokeWidth="3" />
                <text x="0" y="10" textAnchor="middle" fontSize="28" fill="#8f6a39" letterSpacing="6" fontFamily="var(--font-display), serif">
                  VERKAUFT
                </text>
              </g>
            )}
          </g>
        </svg>

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
    </section>
  );
}
