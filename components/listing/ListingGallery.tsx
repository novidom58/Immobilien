"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type Photo = { url: string };

/**
 * Titelbild mit Vorschaubildern. Ein Klick öffnet die Bilder gross,
 * mit Pfeilen, Tastatur (← → Esc) und Zähler. Kein Scroll-Effekt.
 */
export function ListingGallery({ photos, badges }: { photos: Photo[]; badges?: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = photos.length;

  const go = useCallback((delta: number) => setOpen((i) => (i === null ? i : (i + delta + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  if (count === 0) return null;
  const [main, ...rest] = photos;
  const thumbs = rest.slice(0, 5);
  const more = count - 1 - thumbs.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(0)}
        className="group relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-ink-2"
        aria-label="Bilder gross anzeigen"
      >
        <Image src={main.url} alt="" fill sizes="(min-width: 1024px) 1000px, 100vw" priority className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
        {badges}
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 font-mono text-[11px] uppercase tracking-wide text-ivory shadow-sm backdrop-blur">
          <Expand className="h-3.5 w-3.5" strokeWidth={1.75} />
          {count} {count === 1 ? "Bild" : "Bilder"}
        </span>
      </button>

      {thumbs.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {thumbs.map((photo, i) => (
            <button
              key={`${i}-${photo.url}`}
              type="button"
              onClick={() => setOpen(i + 1)}
              className="relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-xl bg-ink-2"
              aria-label={`Bild ${i + 2} gross anzeigen`}
            >
              <Image src={photo.url} alt="" fill sizes="220px" className="object-cover transition-transform duration-300 hover:scale-105" />
              {i === thumbs.length - 1 && more > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-night/55 font-display text-xl text-white">+{more}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bildergalerie"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111]"
          onClick={() => setOpen(null)}
        >
          <div className="relative h-[82svh] w-[94vw]" onClick={(e) => e.stopPropagation()}>
            <Image key={photos[open].url} src={photos[open].url} alt="" fill sizes="94vw" className="object-contain" />
          </div>
          <button type="button" onClick={() => setOpen(null)} aria-label="Schliessen" className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Vorheriges Bild"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Nächstes Bild"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs tracking-wide text-white/70">
            {open + 1} / {count}
          </span>
        </div>
      )}
    </>
  );
}
