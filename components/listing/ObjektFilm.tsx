"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

/**
 * Objekt-Film: ein aus echten Fotos erzeugter Rundgang (KI-Übergänge), der
 * beim Scrollen vor- und zurückläuft. Ohne Bewegung (prefers-reduced-motion)
 * ein normaler Player. Auf kleinen Bildschirmen die leichtere Fassung.
 */
export function ObjektFilm({ src, poster }: { src: string; poster?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(sectionRef);
  const target = useRef(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  // Quelle erst im Browser wählen (Handy: kleinere Datei)
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
        current += (goal - current) * 0.18;
        if (Math.abs(video.currentTime - current) > 0.02) video.currentTime = current;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reduced, ready]);

  if (reduced) {
    return (
      <section className="mt-16">
        <Heading />
        <video src={src} poster={poster} controls muted playsInline preload="metadata" className="mt-5 aspect-video w-full rounded-2xl bg-ink-2 object-cover" />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative mt-16 h-[260vh]" aria-label="Objekt-Film">
      <div className="sticky top-0 flex h-svh flex-col justify-center py-20">
        <Heading />
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-line bg-ink-2">
          {source && (
            <video
              ref={videoRef}
              src={source}
              poster={poster}
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={(e) => {
                // iOS zeigt Einzelbilder erst nach einem kurzen Abspielen
                const v = e.currentTarget;
                v.play()
                  .then(() => v.pause())
                  .catch(() => {})
                  .finally(() => setReady(true));
              }}
              className="aspect-video max-h-[70svh] w-full object-cover"
            />
          )}
          <span className="absolute left-4 top-4 rounded-full border border-line bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-ivory-dim backdrop-blur-sm">
            KI-Visualisierung aus echten Fotos
          </span>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-ink/40">
            <div className="h-full bg-amber" style={{ width: `${progress * 100}%` }} />
          </div>
          {progress < 0.02 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-ivory backdrop-blur-sm">
              Scrollen für den Rundgang ↓
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function Heading() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h2 className="font-display text-2xl font-semibold text-ivory">Rundgang</h2>
      <p className="text-xs text-ivory-dim">Übergänge KI-generiert, die Fotos oben sind echt.</p>
    </div>
  );
}
