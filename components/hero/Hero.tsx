"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { HeroHeadline } from "./HeroHeadline";
import { HeroKeyUnlock } from "./HeroKeyUnlock";
import { LOADER_DURATION_MS } from "@/components/Loader";

const HUD_CORNERS = [
  "left-6 top-20 border-l border-t lg:left-10 lg:top-24",
  "right-6 top-20 border-r border-t lg:right-10 lg:top-24",
  "left-6 bottom-6 border-l border-b lg:left-10 lg:bottom-10",
  "right-6 bottom-6 border-r border-b lg:right-10 lg:bottom-10",
];

export function Hero() {
  const [showIntro, setShowIntro] = useState(true);
  const [introStart, setIntroStart] = useState(false);

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

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
      {showIntro && <HeroKeyUnlock start={introStart} onDone={() => setShowIntro(false)} />}

      {/* Nach dem Schlüssel-Intro: das Zuhause selbst. Ruhiger Ken-Burns-Zoom,
          läuft unabhängig vom Scroll. */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.04 }}
        animate={{ scale: 1.12 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
      >
        <Image
          src="/images/novidom-holzhaus.webp"
          alt="Modernes Holzhaus in der Abenddämmerung, im Hintergrund das Basler Münster"
          fill
          sizes="100vw"
          preload
          className="object-cover object-[60%_center]"
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_0%,rgba(10,13,18,0.75)_22%,rgba(10,13,18,0.25)_55%,rgba(10,13,18,0.35)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />
      <div className="grain absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {HUD_CORNERS.map((pos) => (
          <div key={pos} className={`absolute h-9 w-9 border-blueprint/50 lg:h-12 lg:w-12 ${pos}`} />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 lg:px-10 lg:py-40">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-blueprint"
          >
            <span aria-hidden className="h-px w-7 bg-blueprint/60" />
            NoviDom Immo · Basel &amp; Zug
          </motion.div>

          <HeroHeadline text="Ihr Zuhause verdient" accent="den besten Preis." />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-6 max-w-xl text-balance text-lg text-ivory-dim lg:text-xl"
          >
            Verkaufen, finanzieren, umbauen, absichern. Persönlich begleitet, aus einer Hand, zu fairen Kosten.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <a
              href="#leistungen"
              className="rounded-full bg-amber px-7 py-4 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:bg-amber-soft"
            >
              NoviDom 360° entdecken →
            </a>
            <a
              href="#bewertung"
              className="rounded-full border border-amber/50 bg-ink/30 px-7 py-4 font-mono text-xs uppercase tracking-wider text-amber backdrop-blur-sm transition-colors hover:bg-amber hover:text-ink"
            >
              Kostenlose Bewertung
            </a>
          </motion.div>

          <motion.a
            href="#kommission"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-9 inline-flex items-center gap-4 rounded-2xl border border-amber/30 bg-ink/50 px-5 py-3.5 backdrop-blur-sm transition-colors hover:border-amber/60"
          >
            <span className="whitespace-nowrap font-display text-3xl font-semibold text-amber">ab 0.95%</span>
            <span className="text-xs leading-snug text-ivory-dim">
              Provision statt 3%.
              <br />
              Voller Service, nur im Erfolgsfall.
            </span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
