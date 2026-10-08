"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { HeroHeadline } from "./HeroHeadline";
import { HeroKeyUnlock } from "./HeroKeyUnlock";
import { LOADER_DURATION_MS } from "@/components/Loader";

const TRUST = [
  { value: "ab 0.95%", label: "Provision statt 3%", href: "/leistungen/kaufen-verkaufen#kommission" },
  { value: "4 in 1", label: "Verkauf, Finanzierung, Umbau, Versicherung", href: "#leistungen" },
  { value: "Basel & Zug", label: "Persönlich vor Ort", href: "#einzugsgebiet" },
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
    <section id="top" className="relative overflow-hidden bg-ink">
      {showIntro && <HeroKeyUnlock start={introStart} onDone={() => setShowIntro(false)} />}

      <div className="relative mx-auto max-w-5xl px-6 pb-14 pt-36 text-center lg:pt-44">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 inline-block rounded-full bg-ink-3 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim"
        >
          Voller Service · Faire Kosten · Basel &amp; Zug
        </motion.span>

        <HeroHeadline text="Ihr Zuhause verdient" accent="den besten Preis." />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-relaxed text-ivory-dim lg:text-xl"
        >
          Verkaufen, finanzieren, umbauen, absichern. Persönlich begleitet, aus einer Hand, zu fairen Kosten.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-9 flex flex-wrap justify-center gap-3"
        >
          <a
            href="#bewertung"
            className="rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-amber"
          >
            Immobilie bewerten
          </a>
          <a
            href="#leistungen"
            className="rounded-full border border-line bg-ink px-7 py-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory"
          >
            NoviDom 360° entdecken
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mx-auto mt-12 grid max-w-3xl gap-px overflow-hidden rounded-3xl border border-line bg-line shadow-[0_8px_30px_rgba(41,37,27,0.05)] sm:grid-cols-3 sm:rounded-full"
        >
          {TRUST.map((item) => (
            <a key={item.value} href={item.href} className="flex items-center justify-center gap-3 bg-white px-5 py-4 transition-colors hover:bg-ink-2">
              <span className="whitespace-nowrap font-display text-xl text-ivory">{item.value}</span>
              <span className="text-left text-xs leading-snug text-ivory-dim">{item.label}</span>
            </a>
          ))}
        </motion.div>
      </div>

      {/* Das Zuhause selbst: grosse Bildkarte mit ruhigem Ken-Burns-Zoom. */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-7xl px-4 pb-20 lg:px-10"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-[0_30px_80px_-30px_rgba(41,37,27,0.35)] sm:aspect-[16/8]">
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
              sizes="(min-width: 1280px) 1200px, 100vw"
              preload
              className="object-cover object-[60%_center]"
            />
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/55 to-transparent px-6 pb-5 pt-16 text-white lg:px-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/85">NoviDom 360° · Ihr Zuhause im Mittelpunkt</span>
            <a
              href="#kaeufer-radar"
              className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              Wer sucht Ihre Immobilie? →
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
