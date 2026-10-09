"use client";

import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";

type FlightClip = { url: string; label: string };

/**
 * Drohnenflug durch das Objekt: Die Übergangs-Clips enden jeweils dort, wo
 * der nächste beginnt. Beim Scrollen wird die Wiedergabe direkt gesteuert,
 * vorwärts wie rückwärts. So entsteht ein Flug ohne Schnitt.
 */
export function DroneFlight({ clips, title, priceText }: { clips: FlightClip[]; title: string; priceText: string | null }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only media check after mount
    setReduced(isReduced);
    if (isReduced) return;

    let frame = 0;
    let shown = 0; // geglättete Position in "Clip-Einheiten" (0 … clips.length)
    let lastP = -1;

    function tick() {
      const outer = outerRef.current;
      if (outer) {
        const rect = outer.getBoundingClientRect();
        const total = outer.offsetHeight - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        const target = p * clips.length;
        shown += (target - shown) * 0.18;
        if (Math.abs(target - shown) < 0.0005) shown = target;

        const index = Math.min(clips.length - 1, Math.floor(shown));
        const frac = Math.min(1, shown - index);
        const video = videoRefs.current[index];
        if (video && video.duration) {
          const time = Math.min(video.duration - 0.04, frac * video.duration);
          if (Math.abs(video.currentTime - time) > 0.03) video.currentTime = time;
        }
        setActive((prev) => (prev === index ? prev : index));
        if (Math.abs(p - lastP) > 0.002) {
          lastP = p;
          setProgress(p);
        }
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [clips.length]);

  if (reduced) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 lg:px-10">
        <h2 className="mb-6 font-display text-3xl text-ivory">Rundflug durch das Objekt</h2>
        <div className="grid gap-4">
          {clips.map((clip) => (
            <figure key={clip.url}>
              <video src={clip.url} controls playsInline preload="metadata" className="w-full rounded-2xl" />
              <figcaption className="mt-2 text-sm text-ivory-dim">{clip.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  const atEnd = progress > 0.97;
  // Stationen: Startpunkt des ersten Clips plus das Ziel jedes Clips.
  const stations = [clips[0]?.label.split(" → ")[0] ?? "", ...clips.map((c) => c.label.split(" → ").pop() ?? "")];
  const currentStation = Math.round(progress * clips.length);

  return (
    <div ref={outerRef} className="relative bg-night" style={{ height: `${clips.length * 110 + 100}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {clips.map((clip, i) => (
          <video
            key={clip.url}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={clip.url}
            muted
            playsInline
            preload="auto"
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-150"
            style={{ opacity: i === active ? 1 : 0 }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />

        <div className="absolute left-6 top-24 z-10 text-white lg:left-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/70">Rundflug · {title}</div>
          <div key={active} className="mt-3 font-display text-3xl motion-safe:animate-[nd-pop_.4s_ease] lg:text-5xl">
            {clips[active]?.label}
          </div>
        </div>

        {atEnd ? (
          <div className="absolute inset-x-0 bottom-28 z-10 flex flex-col items-center gap-4 text-center text-white">
            <div className="font-display text-3xl lg:text-4xl">Stellen Sie sich vor, hier zu leben.</div>
            {priceText && <div className="text-white/80">{priceText}</div>}
            <MagneticButton href="#anfragen">Jetzt Besichtigung anfragen</MagneticButton>
          </div>
        ) : (
          progress < 0.03 && (
            <div className="absolute inset-x-0 bottom-28 z-10 text-center font-mono text-xs uppercase tracking-[0.24em] text-white/80 motion-safe:animate-pulse">
              Scrollen, um durch die Wohnung zu fliegen ↓
            </div>
          )
        )}

        {/* Stationen als Fortschrittsleiste */}
        <div className="absolute inset-x-6 bottom-8 z-10 lg:inset-x-10">
          <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="mt-3 hidden justify-between font-mono text-[10px] uppercase tracking-[0.16em] sm:flex">
            {stations.map((station, i) => (
              <span key={`${station}-${i}`} className={i === currentStation ? "text-white" : "text-white/50"}>
                {station}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
