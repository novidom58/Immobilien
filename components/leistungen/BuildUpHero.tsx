"use client";

import { useRef } from "react";
import { Block, iso, pts } from "@/components/leistungen/iso";
import { useScrollProgress } from "@/lib/useScrollProgress";

// Fenster auf der linken Front (y = Hausende) bzw. der rechten Seite (x = Hausende)
function WindowFront({ x, z, w, h, y }: { x: number; z: number; w: number; h: number; y: number }) {
  return <polygon points={pts([x, y + 0.02, z], [x + w, y + 0.02, z], [x + w, y + 0.02, z + h], [x, y + 0.02, z + h])} fill="#9db4c8" stroke="#4f6b84" strokeWidth="1" />;
}
function WindowSide({ y, z, w, h, x }: { y: number; z: number; w: number; h: number; x: number }) {
  return <polygon points={pts([x + 0.02, y, z], [x + 0.02, y + w, z], [x + 0.02, y + w, z + h], [x + 0.02, y, z + h])} fill="#b7c9d8" stroke="#4f6b84" strokeWidth="1" />;
}

const HX = 10;
const HY = 7;
const EAVE = 6;
const RIDGE = 8.6;
const O = 0.45; // Dachüberstand

const STEPS = [
  { at: 0.0, title: "Analyse & Plan", text: "Begehung, Wünsche, Budget. Daraus entsteht der Plan." },
  { at: 0.14, title: "Fundament", text: "Statik, Bewilligung und Finanzierung: die Basis, auf der alles steht." },
  { at: 0.3, title: "Rohbau", text: "Wände und Decken. Unsere Fachpartner arbeiten nach einem klaren Terminplan." },
  { at: 0.52, title: "Fenster & Dämmung", text: "Die Hülle macht das Haus effizient. Hier gibt es oft Förderbeiträge." },
  { at: 0.68, title: "Dach & Solar", text: "Dicht, gedämmt und auf Wunsch mit eigenem Strom vom Dach." },
  { at: 0.86, title: "Übergabe", text: "Abnahme mit Mängelliste, dann gehört das Ergebnis Ihnen." },
];

/**
 * Ein Haus, das sich beim Scrollen vom Fundament bis zum Dach aufbaut.
 * Jede Ebene steht für einen Schritt unseres Umbau-Ablaufs.
 */
export function BuildUpHero() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(wrap);

  // Fortschritt einer Ebene 0..1, ab ihrem Startpunkt über eine kurze Strecke
  const layer = (start: number, span = 0.1) => Math.min(1, Math.max(0, (progress - start) / span));
  const style = (p: number) => ({
    opacity: p,
    transform: `translateY(${(1 - p) * -70}px)`,
    transition: "opacity 120ms linear",
  });

  const active = STEPS.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);

  const fundament = layer(0.12);
  const eg = layer(0.26);
  const og = layer(0.36);
  const windows = layer(0.5);
  const roof = layer(0.64);
  const solar = layer(0.76);
  const garden = layer(0.86);
  const grid = 1 - layer(0.2, 0.15);

  return (
    <section ref={wrap} className="relative mx-auto max-w-7xl px-4 lg:px-10" style={{ height: "260vh" }}>
      <div className="sticky top-20 grid h-[calc(100svh-6rem)] items-center gap-6 overflow-hidden rounded-[28px] border border-line bg-white p-5 sm:p-8 lg:grid-cols-[1fr_340px]">
        <svg viewBox="-300 -250 640 560" className="h-full max-h-[62svh] w-full lg:max-h-none" role="img" aria-label="Ein Haus wird vom Fundament bis zum Dach aufgebaut">
          {/* Grundstück */}
          <polygon points={pts([-2.5, -2, -0.6], [13, -2, -0.6], [13, 10, -0.6], [-2.5, 10, -0.6])} fill="#eef0e6" stroke="#191b1d" strokeOpacity="0.1" />
          {/* Planraster am Anfang */}
          <g opacity={grid} stroke="#4f6b84" strokeOpacity="0.45" strokeWidth="0.8">
            {Array.from({ length: 11 }, (_, i) => (
              <line key={`gx${i}`} x1={iso(i, 0, -0.6)[0]} y1={iso(i, 0, -0.6)[1]} x2={iso(i, HY, -0.6)[0]} y2={iso(i, HY, -0.6)[1]} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`gy${i}`} x1={iso(0, i, -0.6)[0]} y1={iso(0, i, -0.6)[1]} x2={iso(HX, i, -0.6)[0]} y2={iso(HX, i, -0.6)[1]} />
            ))}
            <polygon points={pts([0, 0, -0.6], [HX, 0, -0.6], [HX, HY, -0.6], [0, HY, -0.6])} fill="none" stroke="#4f6b84" strokeOpacity="0.9" strokeWidth="1.6" strokeDasharray="6 4" />
          </g>

          <g style={style(fundament)}>
            <Block b={{ x: -0.2, y: -0.2, z: -0.6, dx: HX + 0.4, dy: HY + 0.4, dz: 0.6 }} top="#cfcac1" right="#a9a399" left="#bab4aa" />
          </g>
          <g style={style(eg)}>
            <Block b={{ x: 0, y: 0, z: 0, dx: HX, dy: HY, dz: 3 }} top="#e8e2d6" right="#d9d1c2" left="#efe9dd" />
          </g>
          <g style={style(og)}>
            <Block b={{ x: 0, y: 0, z: 3, dx: HX, dy: HY, dz: 3 }} top="#e8e2d6" right="#d9d1c2" left="#f4efe5" />
            <polygon points={pts([0, HY + 0.02, 2.95], [HX, HY + 0.02, 2.95], [HX, HY + 0.02, 3.1], [0, HY + 0.02, 3.1])} fill="#c8bfae" />
          </g>
          <g style={style(windows)}>
            <WindowFront x={1} z={0.9} w={2.2} h={1.6} y={HY} />
            <WindowFront x={4.2} z={0} w={1.4} h={2.3} y={HY} />
            <WindowFront x={6.6} z={0.9} w={2.4} h={1.6} y={HY} />
            <WindowFront x={1} z={3.9} w={1.8} h={1.4} y={HY} />
            <WindowFront x={4.1} z={3.9} w={1.8} h={1.4} y={HY} />
            <WindowFront x={7.2} z={3.9} w={1.8} h={1.4} y={HY} />
            <WindowSide y={1.2} z={0.9} w={1.8} h={1.6} x={HX} />
            <WindowSide y={4.2} z={0.9} w={1.8} h={1.6} x={HX} />
            <WindowSide y={2.6} z={3.9} w={1.8} h={1.4} x={HX} />
          </g>
          <g style={style(roof)} stroke="#191b1d" strokeOpacity="0.2" strokeWidth="0.8" strokeLinejoin="round">
            <polygon points={pts([-O, HY / 2, RIDGE], [HX + O, HY / 2, RIDGE], [HX + O, -O, EAVE], [-O, -O, EAVE])} fill="#6f5230" />
            <polygon points={pts([HX, -0.01, EAVE], [HX, HY + 0.01, EAVE], [HX, HY / 2, RIDGE])} fill="#e2dacb" />
            <polygon points={pts([-O, HY + O, EAVE], [HX + O, HY + O, EAVE], [HX + O, HY / 2, RIDGE], [-O, HY / 2, RIDGE])} fill="#8f6a39" />
          </g>
          <g style={style(solar)}>
            {[0, 1, 2, 3].map((i) => {
              const x0 = 1 + i * 2.1;
              const a = 0.18;
              const b = 0.78;
              // Punkte auf der vorderen Dachfläche: von der Traufe (y=HY+O, z=EAVE) zum First
              const at = (x: number, t: number) => [x, HY + O - t * (HY / 2 + O), EAVE + t * (RIDGE - EAVE)] as [number, number, number];
              return <polygon key={i} points={pts(at(x0, a), at(x0 + 1.8, a), at(x0 + 1.8, b), at(x0, b))} fill="#25344a" stroke="#9db4c8" strokeWidth="0.8" />;
            })}
          </g>
          <g style={style(garden)}>
            {[
              [11.6, 1.5],
              [12, 5.2],
              [-1.6, 8.6],
            ].map(([x, y]) => {
              const [cx, cy] = iso(x, y, -0.6);
              return (
                <g key={`${x}-${y}`}>
                  <rect x={cx - 2} y={cy - 26} width="4" height="26" fill="#7a5a36" />
                  <circle cx={cx} cy={cy - 40} r="20" fill="#8aa37a" />
                </g>
              );
            })}
            <polygon points={pts([4.2, HY, -0.58], [5.6, HY, -0.58], [5.6, 9.8, -0.58], [4.2, 9.8, -0.58])} fill="#d8d0c2" />
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
