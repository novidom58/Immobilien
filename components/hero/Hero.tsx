"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { HeroHeadline } from "./HeroHeadline";
import { HeroKeyUnlock } from "./HeroKeyUnlock";
import { LOADER_DURATION_MS } from "@/components/Loader";
import { BlueprintHouse } from "@/components/novidom360/BlueprintHouse";

const HUD_CORNERS = [
  "left-3 top-3 border-l border-t",
  "right-3 top-3 border-r border-t",
  "left-3 bottom-3 border-l border-b",
  "right-3 bottom-3 border-r border-b",
];

// Stufen 1-5 des Bauplan-Hauses, im Hero als Endlosschleife.
const CYCLE = ["Ihre Immobilie", "Bewerten", "Verkaufen", "Umbauen", "Finanzieren", "Absichern"];

export function Hero() {
  const [showIntro, setShowIntro] = useState(true);
  const [introStart, setIntroStart] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only media check, must run post-mount to stay hydration-safe
      setShowIntro(false);
      return;
    }
    // Wartet, bis der sitewide Loader fertig ist, damit die grosse
    // Schlüssel-Animation sichtbar von vorne beginnt statt verdeckt zu laufen.
    const timer = setTimeout(() => setIntroStart(true), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    function next() {
      setStage((s) => (s % 5) + 1);
      timer = setTimeout(next, 2600);
    }
    timer = setTimeout(next, LOADER_DURATION_MS + 2400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
      {showIntro && <HeroKeyUnlock start={introStart} onDone={() => setShowIntro(false)} />}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(95,184,232,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(95,184,232,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(26,33,48,0.9),transparent_60%)]" />
      <div className="grain absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 py-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-10 lg:py-36">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-blueprint"
          >
            <span aria-hidden className="h-px w-7 bg-blueprint/60" />
            NoviDom Immo · Basel &amp; Zug
          </motion.div>

          <HeroHeadline text="Ihre Immobilie." accent="Unsere Expertise." />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-6 max-w-xl text-balance text-lg text-ivory-dim lg:text-xl"
          >
            Von der ersten Idee bis zum fertigen Zuhause. Verkaufen, umbauen, finanzieren,
            versichern. Aus einer Hand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#journey"
              className="rounded-full bg-amber px-7 py-4 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:bg-amber-soft"
            >
              Immobilie entdecken →
            </a>
            <a
              href="#bewertung"
              className="rounded-full border border-amber/50 px-7 py-4 font-mono text-xs uppercase tracking-wider text-amber transition-colors hover:bg-amber hover:text-ink"
            >
              Kostenlose Bewertung
            </a>
          </motion.div>

          <motion.a
            href="#kommission"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-9 inline-flex items-center gap-4 rounded-2xl border border-amber/25 bg-amber/5 px-5 py-3.5 transition-colors hover:border-amber/50"
          >
            <span className="font-display text-3xl font-semibold text-amber">ab 0.95%</span>
            <span className="text-xs leading-snug text-ivory-dim">
              Provision statt 3%.
              <br />
              Voller Service, nur im Erfolgsfall.
            </span>
          </motion.a>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative aspect-[5/4] rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_40%,#151b27,var(--color-ink))] p-5"
        >
          {HUD_CORNERS.map((pos) => (
            <span key={pos} aria-hidden className={`absolute h-6 w-6 border-blueprint/50 ${pos}`} />
          ))}
          <BlueprintHouse stage={stage} label="Haus als Bauplan, wechselt durch Bewerten, Verkaufen, Umbauen, Finanzieren und Absichern" />
          <span
            aria-hidden
            className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-ink/80 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-soft"
          >
            {CYCLE[stage]}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
