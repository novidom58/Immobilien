"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

export type FilmCard = { title: string; lines: string[] };

/**
 * Objekt-Film bildschirmfüllend: ein durchgehender Rundgang (KI-Kamerafahrt
 * aus echten Fotos), der beim Scrollen vor- und zurückläuft. Dazu erscheinen
 * passende Infokarten. Ohne Bewegung (prefers-reduced-motion) ein normaler
 * Player. Auf kleinen Bildschirmen lädt die leichtere Fassung.
 */
export function ObjektFilm({
  src,
  poster,
  kicker,
  title,
  price,
  cards,
}: {
  src: string;
  poster?: string;
  kicker: string;
  title: string;
  price?: string | null;
  cards: FilmCard[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(sectionRef);
  const target = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      setSource(window.innerWidth < 768 && /-1280\.mp4$/.test(src) ? src.replace(/-1280\.mp4$/, "-854.mp4") : src);
    });
    return () => cancelAnimationFrame(id);
  }, [src]);

  useEffect(() => {
    target.current = progress;
  }, [progress]);

  // Weich zur Scroll-Position nachführen
  useEffect(() => {
    if (reduced || !ready) return;
    const video = videoRef.current;
    if (!video) return;
    let frame = 0;
    let current = video.currentTime;
    const loop = () => {
      const duration = video.duration || 0;
      if (duration > 0) {
        const goal = target.current * (duration - 0.05);
        current += (goal - current) * 0.16;
        if (Math.abs(video.currentTime - current) > 0.02) video.currentTime = current;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reduced, ready]);

  // Sicherheitsnetz: nach 8 Sekunden trotzdem freigeben
  useEffect(() => {
    if (!source) return;
    const id = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(id);
  }, [source]);

  if (reduced) {
    return (
      <section className="mx-auto max-w-6xl px-6 pt-32 lg:px-10">
        <video src={src} poster={poster} controls muted playsInline preload="metadata" className="aspect-video w-full rounded-2xl bg-ink-2 object-cover" />
        <p className="mt-2 text-xs text-ivory-dim">Rundgang: Kamerafahrt KI-generiert aus echten Fotos.</p>
      </section>
    );
  }

  // Zeitfenster pro Karte, gleichmässig zwischen Intro und Schluss verteilt
  const start = 0.1;
  const end = 0.9;
  const slot = (end - start) / Math.max(1, cards.length);
  const fade = (from: number, to: number) => {
    const ramp = Math.min(0.04, (to - from) / 4);
    if (progress < from || progress > to) return 0;
    return Math.min(1, (progress - from) / ramp, (to - progress) / ramp);
  };
  const intro = progress < 0.08 ? 1 - progress / 0.08 : 0;
  const outro = progress > 0.92 ? Math.min(1, (progress - 0.92) / 0.04) : 0;

  return (
    <section ref={sectionRef} className="relative h-[560vh] bg-black" aria-label="Rundgang durch das Objekt">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {source && (
          <video
            ref={videoRef}
            src={source}
            poster={poster}
            muted
            playsInline
            preload="auto"
            onProgress={(e) => {
              const v = e.currentTarget;
              if (v.duration && v.buffered.length) setLoaded(Math.min(1, v.buffered.end(v.buffered.length - 1) / v.duration));
            }}
            onCanPlayThrough={() => setReady(true)}
            onLoadedMetadata={(e) => {
              // iOS zeigt Einzelbilder erst nach einem kurzen Abspielen
              const v = e.currentTarget;
              v.play()
                .then(() => v.pause())
                .catch(() => {});
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/40" />

        <span className="absolute right-4 top-24 rounded-full border border-white/25 bg-black/35 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-white/85 backdrop-blur-sm lg:right-8">
          KI-Kamerafahrt aus echten Fotos
        </span>

        {/* Intro */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-20 lg:px-16" style={{ opacity: intro, transform: `translateY(${(1 - intro) * -20}px)` }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/75">{kicker}</p>
          <h2 className="mt-3 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.05] text-white md:text-6xl">{title}</h2>
          {price && <p className="mt-4 font-display text-2xl text-white/90">{price}</p>}
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">Scrollen für den Rundgang ↓</p>
        </div>

        {/* Infokarten */}
        {cards.map((c, i) => {
          const o = fade(start + i * slot, start + (i + 1) * slot);
          if (o <= 0) return null;
          return (
            <div
              key={c.title}
              className="absolute bottom-16 left-6 max-w-sm rounded-2xl border border-white/20 bg-black/40 p-6 text-white backdrop-blur-md lg:bottom-20 lg:left-16"
              style={{ opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/65">
                {String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">{c.title}</h3>
              <ul className="mt-3 space-y-1 text-sm text-white/85">
                {c.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Schluss */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 px-6 pb-20 lg:px-16"
          style={{ opacity: outro, pointerEvents: outro > 0.5 ? "auto" : "none" }}
        >
          <h2 className="font-display text-4xl font-semibold text-white md:text-5xl">Selbst erleben?</h2>
          <div className="flex flex-wrap gap-3">
            <a href="#anfragen" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90">
              Besichtigung anfragen
            </a>
            <a href="#details" className="rounded-full border border-white/50 px-6 py-3 text-sm text-white hover:border-white">
              Fotos und Details ↓
            </a>
          </div>
        </div>

        {/* Fortschritt */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
          <div className="h-full bg-white/80" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Ladebildschirm */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700"
          style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? "none" : "auto" }}
          aria-hidden={ready}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">{kicker}</p>
          <p className="mt-3 font-display text-3xl md:text-5xl">Objekt erleben</p>
          <div className="mt-6 h-px w-48 overflow-hidden bg-white/20">
            <div className="h-full bg-white transition-[width] duration-300" style={{ width: `${Math.max(8, loaded * 100)}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
