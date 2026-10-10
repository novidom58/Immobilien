"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

// Gezackter Siegelrand mit 28 Zacken, einmal beim Laden berechnet.
const STAR_PATH = (() => {
  const spikes = 28;
  const points: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 98 : 88;
    const a = (Math.PI * i) / spikes;
    points.push(`${(Math.sin(a) * r).toFixed(2)},${(-Math.cos(a) * r).toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
})();

export type ShowcaseItem = {
  id: string;
  image: string;
  place: string;
  facts: string;
};

const SLIDE_MS = 6500;

/**
 * Grosse Bildkarte im Hero: zeigt reihum die aktuellen Objekte von NoviDom.
 * Neue Inserate erscheinen automatisch, nichts muss von Hand gewechselt
 * werden. Ohne Inserate bleibt das Holzhaus stehen.
 */
export function HeroShowcase({ items }: { items: ShowcaseItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [items.length]);

  const current = items[index];

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-ink-3 shadow-[0_30px_80px_-30px_rgba(41,37,27,0.35)] sm:aspect-[16/8]">
        <AnimatePresence initial={false}>
          <motion.div
            key={current ? current.id : "fallback"}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: SLIDE_MS / 1000 + 1.2, ease: "linear" } }}
          >
            <Image
              src={current ? current.image : "/images/novidom-holzhaus.webp"}
              alt={current ? `Aktuelles Objekt in ${current.place}` : "Modernes Holzhaus in der Abenddämmerung, im Hintergrund das Basler Münster"}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              preload={index === 0}
              unoptimized={Boolean(current)}
              className="object-cover object-[60%_center]"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/60 to-transparent px-6 pb-5 pt-20 text-white lg:px-8">
          {current ? (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">Aktuell bei NoviDom</div>
              <div className="mt-1 font-display text-2xl lg:text-3xl">{current.place}</div>
              <div className="text-sm text-white/85">{current.facts}</div>
            </div>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/85">NoviDom 360° · Ihr Zuhause im Mittelpunkt</span>
          )}
          <div className="flex items-center gap-3">
            {items.length > 1 && (
              <div className="flex gap-1.5" aria-hidden>
                {items.map((item, i) => (
                  <span key={item.id} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            )}
            <Link
              href={current ? `/immobilien/${current.id}` : "#kaeufer-radar"}
              className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              {current ? "Objekt ansehen →" : "Wer sucht Ihre Immobilie? →"}
            </Link>
          </div>
        </div>
      </div>

      {/* Provisions-Siegel: bewusst gross und verspielt, das Hauptargument */}
      <motion.div
        className="absolute -top-10 right-3 z-10 sm:-top-16 sm:right-8"
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: -8 }}
        transition={{ type: "spring", stiffness: 260, damping: 10, delay: 1.6 }}
      >
        <Link
          href="/leistungen/kaufen-verkaufen#kommission"
          aria-label="Nur ab 0.95% Provision statt 3%"
          className="group relative flex h-32 w-32 items-center justify-center transition-transform hover:scale-110 motion-safe:animate-[nd-wiggle_7s_ease-in-out_3.5s_infinite] sm:h-48 sm:w-48"
        >
          {/* Pulsierende Wellen hinter dem Siegel */}
          <span aria-hidden className="absolute inset-3 rounded-full bg-amber motion-safe:animate-[nd-pulse_2.6s_ease-out_infinite]" />
          <span aria-hidden className="absolute inset-3 rounded-full bg-amber motion-safe:animate-[nd-pulse_2.6s_ease-out_1.3s_infinite]" />
          {/* Gezackter Rand, dreht langsam */}
          <svg
            aria-hidden
            viewBox="-100 -100 200 200"
            className="absolute inset-0 h-full w-full drop-shadow-[0_18px_30px_rgba(143,106,57,0.55)] motion-safe:animate-[spin_24s_linear_infinite]"
          >
            <path d={STAR_PATH} className="fill-amber" />
            <circle r="80" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="3 5" />
          </svg>
          {/* Glanz, der über das Siegel streicht */}
          <span aria-hidden className="absolute inset-[14%] overflow-hidden rounded-full">
            <span className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent motion-safe:animate-[nd-shine_4.5s_ease-in-out_2.5s_infinite]" />
          </span>
          <span className="relative flex flex-col items-center text-center text-white">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/90 sm:text-xs">nur ab</span>
            <span className="font-display text-[2.1rem] font-semibold leading-none tracking-tight sm:text-[2.9rem]">0.95%</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs">Provision</span>
            <span className="mt-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-amber sm:text-xs">
              statt <span className="line-through decoration-2">3%</span>
            </span>
          </span>
        </Link>
      </motion.div>
    </div>
  );
}
