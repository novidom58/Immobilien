"use client";

import { useEffect, useRef } from "react";

/**
 * Ruhiges Hintergrund-Video oben auf einer Leistungsseite (KI-Visualisierung,
 * deshalb klein beschriftet). Startet nur, wenn niemand reduzierte Bewegung
 * eingestellt hat; sonst bleibt das erste Bild stehen.
 */
export function ServiceVideo({ src, caption }: { src: string; caption: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 lg:px-10">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-ink-3 shadow-[0_30px_80px_-30px_rgba(41,37,27,0.35)] sm:aspect-[16/7]">
        <video
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-6 pb-4 pt-14 text-white lg:px-8">
          <p className="max-w-xl font-display text-xl leading-snug lg:text-2xl">{caption}</p>
        </div>
        <span className="absolute right-4 top-4 rounded-full bg-black/35 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
          Visualisierung
        </span>
      </div>
    </section>
  );
}
