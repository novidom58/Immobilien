"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AppWindow,
  Car,
  CloudHail,
  Droplets,
  Flame,
  HeartPulse,
  House,
  PiggyBank,
  Plane,
  ReceiptText,
  Scale,
  ShieldCheck,
  Sofa,
  Users,
  type LucideIcon,
} from "lucide-react";

type Item = { icon: LucideIcon; label: string };
type Ring = { name: string; claim: string; items: Item[] };

// Von innen nach aussen: was im Haus ist, das Haus selbst, die Menschen darin.
const RINGS: Ring[] = [
  {
    name: "Ihr Hab & Gut",
    claim: "Alles, was in Ihrem Zuhause steht und mit Ihnen unterwegs ist.",
    items: [
      { icon: Sofa, label: "Hausrat" },
      { icon: AppWindow, label: "Glasbruch" },
      { icon: ShieldCheck, label: "Privathaftpflicht" },
      { icon: Scale, label: "Rechtsschutz" },
      { icon: Plane, label: "Reise" },
      { icon: Car, label: "Auto & Kasko" },
    ],
  },
  {
    name: "Ihr Gebäude",
    claim: "Die Mauern, das Dach und alles, was fest verbaut ist.",
    items: [
      { icon: Flame, label: "Feuer" },
      { icon: CloudHail, label: "Elementar & Hagel" },
      { icon: Droplets, label: "Gebäudewasser" },
      { icon: Activity, label: "Erdbeben" },
      { icon: House, label: "Gebäudehaftpflicht" },
    ],
  },
  {
    name: "Sie & Ihre Familie",
    claim: "Damit die Hypothek tragbar bleibt, auch wenn das Leben anders kommt.",
    items: [
      { icon: HeartPulse, label: "Erwerbsunfähigkeit" },
      { icon: Users, label: "Todesfall" },
      { icon: PiggyBank, label: "Säule 3a & Sparen" },
      { icon: ReceiptText, label: "Steuern sparen" },
    ],
  },
];

const RADIUS = [27, 37, 47]; // in % der Bühne

/**
 * Schutz von innen nach aussen: zuerst Hab & Gut, dann das Gebäude, dann
 * die Menschen. Die Ringe bauen sich nacheinander auf und lassen sich
 * danach antippen; die Liste daneben erklärt den aktiven Ring.
 */
export function ProtectionVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- ohne Bewegung alle Ringe sofort zeigen
      setShown(RINGS.length);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || timer) return;
        let step = 0;
        timer = setInterval(() => {
          step++;
          if (step <= RINGS.length) {
            setShown(step);
            setActive(step - 1);
          } else if (timer) {
            clearInterval(timer);
          }
        }, 1400);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  // Nach dem Aufbau wandert die Hervorhebung weiter, bis jemand tippt
  useEffect(() => {
    if (manual || shown < RINGS.length) return;
    const t = setInterval(() => setActive((a) => (a + 1) % RINGS.length), 4200);
    return () => clearInterval(t);
  }, [manual, shown]);

  function pick(i: number) {
    setManual(true);
    setShown(RINGS.length);
    setActive(i);
  }

  const ring = RINGS[active];

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-10">
      <div ref={ref} className="overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-[#f3efe7] via-white to-[#eef2f6] p-5 sm:p-10">
        <div className="text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Rundum-Schutz · von innen nach aussen</div>
          <h2 className="mx-auto mt-3 max-w-2xl text-balance font-display text-3xl text-ivory lg:text-4xl">
            Damit Ihr Traumzuhause <em>ein Traum bleibt.</em>
          </h2>
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Bühne mit Ringen */}
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            {RINGS.map((r, i) => {
              const on = i < shown;
              return (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => pick(i)}
                  aria-label={r.name}
                  className="absolute left-1/2 top-1/2 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${RADIUS[i] * 2}%`,
                    height: `${RADIUS[i] * 2}%`,
                    transform: `translate(-50%, -50%) scale(${on ? 1 : 0.6})`,
                    opacity: on ? 1 : 0,
                    border: `${i === active ? 3 : 1.5}px ${i === 0 ? "solid" : "dashed"} rgba(143,106,57,${i === active ? 0.9 : 0.45})`,
                    background: i === active ? "rgba(143,106,57,0.06)" : "transparent",
                    zIndex: 3 - i,
                  }}
                />
              );
            })}
            {/* Puls nach aussen */}
            {shown === RINGS.length && (
              <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[94%] w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber/30 motion-safe:animate-[nd-pulse_3.2s_ease-out_infinite]" />
            )}
            {/* Haus im Zentrum */}
            <div className="absolute left-1/2 top-1/2 z-10 flex h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber text-white shadow-[0_18px_40px_-12px_rgba(143,106,57,0.7)]">
              <House className="h-1/2 w-1/2" strokeWidth={1.4} />
            </div>
            {/* Symbole auf den Ringen */}
            {RINGS.map((r, i) =>
              r.items.map((it, j) => {
                const angle = (-90 + (360 / r.items.length) * j + i * 22) * (Math.PI / 180);
                // gerundet, damit Server und Browser denselben Wert schreiben
                const x = Math.round((50 + Math.cos(angle) * RADIUS[i]) * 100) / 100;
                const y = Math.round((50 + Math.sin(angle) * RADIUS[i]) * 100) / 100;
                const on = i < shown;
                return (
                  <span
                    key={it.label}
                    title={it.label}
                    className={`absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all duration-700 sm:h-11 sm:w-11 ${
                      i === active ? "border-amber bg-amber text-white" : "border-line bg-white text-amber"
                    }`}
                    style={{ left: `${x}%`, top: `${y}%`, opacity: on ? 1 : 0, transform: `translate(-50%, -50%) scale(${on ? 1 : 0.3})`, transitionDelay: `${j * 90}ms` }}
                  >
                    <it.icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.6} />
                  </span>
                );
              })
            )}
          </div>

          {/* Erklärung zum aktiven Ring */}
          <div>
            <div className="flex flex-wrap gap-2" role="tablist">
              {RINGS.map((r, i) => (
                <button
                  key={r.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => pick(i)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${i === active ? "bg-night text-ink" : "border border-line bg-white text-ivory-dim hover:text-ivory"}`}
                >
                  {i + 1}. {r.name}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-line bg-white p-6" aria-live="polite">
              <div className="font-display text-2xl text-ivory">{ring.name}</div>
              <p className="mt-1 text-sm text-ivory-dim">{ring.claim}</p>
              <ul className="mt-5 grid grid-cols-2 gap-3">
                {ring.items.map((it) => (
                  <li key={it.label} className="flex items-center gap-2.5 text-sm text-ivory">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber/10 text-amber">
                      <it.icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    {it.label}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
              Wir prüfen alle drei Ringe zusammen. So entstehen keine Lücken und keine doppelten Prämien.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
