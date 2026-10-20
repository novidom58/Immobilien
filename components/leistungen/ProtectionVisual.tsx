"use client";

import { useEffect, useRef, useState } from "react";

const LAYERS = [
  { name: "Gebäude", text: "Feuer, Sturm, Hagel, Hochwasser", r: 150 },
  { name: "Wasser & Glas", text: "Leitungswasser, Rückstau, Glasbruch", r: 178 },
  { name: "Hausrat", text: "Möbel, Geräte, Diebstahl", r: 206 },
  { name: "Haftpflicht", text: "Schäden an Dritten, auch durchs Gebäude", r: 234 },
  { name: "Rechtsschutz", text: "Streit mit Handwerkern oder Nachbarn", r: 262 },
];

const DROPS = [
  [-220, 0],
  [-150, 0.6],
  [-80, 1.2],
  [-10, 0.3],
  [60, 0.9],
  [130, 1.5],
  [200, 0.45],
  [250, 1.1],
] as const;

/**
 * Ein Haus unter fünf Schutzschichten. Beim Erscheinen baut sich eine
 * Schicht nach der anderen auf; Hagel und Regen prallen an der äussersten ab.
 */
export function ProtectionVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ohne Bewegung alle Schichten sofort zeigen
      setShown(LAYERS.length);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !timer) {
          timer = setInterval(() => {
            setShown((n) => {
              if (n >= LAYERS.length && timer) clearInterval(timer);
              return Math.min(LAYERS.length, n + 1);
            });
          }, 650);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  const outer = LAYERS[Math.max(0, shown - 1)].r;

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-10">
      <div ref={ref} className="grid items-center gap-6 overflow-hidden rounded-[28px] border border-line bg-gradient-to-b from-[#eef2f6] to-white p-5 sm:p-8 lg:grid-cols-[1.3fr_1fr]">
        <svg viewBox="-300 -300 600 380" className="h-auto w-full" role="img" aria-label="Haus unter fünf Schutzschichten: Gebäude, Wasser und Glas, Hausrat, Haftpflicht, Rechtsschutz">
          <style>{`
            @keyframes nd-drop { 0% { transform: translateY(-40px); opacity: 0 } 15% { opacity: .8 } 100% { transform: translateY(var(--stop)); opacity: 0 } }
            @keyframes nd-flash { 0%, 86%, 100% { opacity: 0 } 88%, 92% { opacity: 1 } }
            @media (prefers-reduced-motion: reduce) { .nd-anim { animation: none !important; opacity: 0 } }
          `}</style>
          {/* Wolke und Blitz */}
          <g transform="translate(-170 -268)" opacity="0.9">
            <ellipse cx="0" cy="10" rx="58" ry="20" fill="#c9d3dc" />
            <ellipse cx="-28" cy="0" rx="30" ry="22" fill="#d6dee5" />
            <ellipse cx="20" cy="-6" rx="34" ry="26" fill="#dfe6ec" />
            <path className="nd-anim" d="M6 26 L-8 52 L4 52 L-6 78 L18 44 L6 44 L14 26 Z" fill="#e2b13c" style={{ animation: "nd-flash 4.5s infinite" }} />
          </g>
          <g transform="translate(150 -278)" opacity="0.85">
            <ellipse cx="0" cy="10" rx="64" ry="20" fill="#d6dee5" />
            <ellipse cx="26" cy="-4" rx="34" ry="24" fill="#e1e7ed" />
          </g>

          {/* Hagel und Regen, prallt an der äussersten Schicht ab */}
          {DROPS.map(([x, delay]) => {
            // Fallweg bis zur Schicht: Kuppel bei y = 60 - sqrt(r² - x²), Tropfen startet bei y = -222
            const stop = 282 - Math.sqrt(Math.max(0, outer * outer - x * x));
            return (
              <line
                key={x}
                className="nd-anim"
                x1={x}
                y1={-235}
                x2={x - 4}
                y2={-222}
                stroke="#6f8aa3"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ animation: `nd-drop 1.8s ${delay}s infinite linear`, ["--stop" as string]: `${stop}px` }}
              />
            );
          })}

          {/* Schutzschichten */}
          {LAYERS.map((l, i) => (
            <path
              key={l.name}
              d={`M${-l.r} 60 A${l.r} ${l.r} 0 0 1 ${l.r} 60`}
              fill={i === 0 ? "#8f6a39" : "none"}
              fillOpacity={i === 0 ? 0.06 : 0}
              stroke="#8f6a39"
              strokeOpacity={0.85 - i * 0.12}
              strokeWidth={i === shown - 1 ? 4 : 2.2}
              strokeDasharray={i === 0 ? undefined : "2 7"}
              strokeLinecap="round"
              style={{ opacity: i < shown ? 1 : 0, transition: "opacity 500ms, stroke-width 300ms" }}
            />
          ))}

          {/* Haus */}
          <g>
            <rect x="-96" y="-30" width="192" height="90" fill="#f4efe5" stroke="#191b1d" strokeOpacity="0.25" />
            <path d="M-116 -26 L0 -112 L116 -26 Z" fill="#8f6a39" />
            <rect x="-70" y="-6" width="40" height="34" fill="#9db4c8" stroke="#4f6b84" strokeWidth="1.5" />
            <rect x="30" y="-6" width="40" height="34" fill="#9db4c8" stroke="#4f6b84" strokeWidth="1.5" />
            <rect x="-16" y="12" width="32" height="48" fill="#6f5230" />
            <rect x="-300" y="60" width="600" height="20" fill="#e3e8dc" />
          </g>
        </svg>

        <ul className="grid gap-2">
          {LAYERS.map((l, i) => (
            <li
              key={l.name}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-500 ${i < shown ? "border-line bg-white opacity-100" : "border-transparent opacity-30"}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber text-xs font-semibold text-white">{i + 1}</span>
              <span>
                <span className="block font-display text-lg leading-tight text-ivory">{l.name}</span>
                <span className="text-sm text-ivory-dim">{l.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
