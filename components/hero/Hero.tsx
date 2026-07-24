"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { HeroHeadline } from "./HeroHeadline";
import { HeroPhotoSequence } from "./HeroPhotoSequence";
import { MagneticButton } from "@/components/ui/MagneticButton";

const Hero3DScene = dynamic(() => import("./Hero3DScene"), { ssr: false });

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink"
    >
      {/* Photo crossfade sits behind as a graceful base/fallback layer */}
      <HeroPhotoSequence />
      <div className="absolute inset-0">
        <Hero3DScene />
      </div>

      {/* Legibility + mood gradients so copy stays readable over the photo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_0%,rgba(10,13,18,0.92)_28%,rgba(10,13,18,0.5)_55%,rgba(10,13,18,0.15)_80%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-ink/35" />
      <div className="grain absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-40 lg:px-10 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber/40 bg-ink/40 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-soft">
            Nur wenige Bewertungstermine pro Monat
          </span>
        </motion.div>

        <HeroHeadline text="Ihr Zuhause verdient den besten Preis." />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 max-w-xl text-balance text-lg text-ivory-dim lg:text-xl"
        >
          Gleiche Qualität wie grosse Makler — professionelle IAZI-Bewertung,
          Matterport-3D-Rundgang und persönliche Begleitung bis zum Notar.
          Zu <span className="font-mono text-amber-soft">0.95%</span> statt 3%.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <MagneticButton href="#kontakt">
            Jetzt kostenlose Bewertung sichern
          </MagneticButton>
          <span className="font-sans text-sm text-ivory-dim">
            Exklusiv &amp; persönlich · begrenzte Plätze
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 lg:bottom-10"
      >
        <div className="flex flex-col items-center gap-2 text-ivory-dim">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <span className="h-9 w-px animate-pulse-slow bg-ivory-dim" />
        </div>
      </motion.div>
    </section>
  );
}
