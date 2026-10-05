"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

type Photo = { url: string; sort_order: number };

type Slide = {
  tag: string;
  title: string;
  text: string;
  image: string;
  cta?: boolean;
};

const MIDDLE_CAPTIONS = [
  { tag: "Raumgefühl", title: "Lichtdurchflutete Räume", text: "Durchdachte Aufteilung und hochwertige Materialien auf den ersten Blick." },
  { tag: "Details", title: "Qualität, die man sieht", text: "Jedes Detail wurde mit Sorgfalt ausgewählt und umgesetzt." },
  { tag: "Atmosphäre", title: "Ein Ort zum Ankommen", text: "Ruhe, Licht und Grosszügigkeit prägen jeden Raum." },
  { tag: "Ausblick", title: "Mehr als nur vier Wände", text: "Die Lage und Umgebung machen dieses Zuhause besonders." },
];

function formatChf(value: number) {
  return `CHF ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

function buildSlides(listing: { title: string | null; address: string; city: string; price_chf: number | null }, photos: Photo[]): Slide[] {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order).slice(0, 6);
  const total = sorted.length;

  return sorted.map((photo, i) => {
    if (i === 0) {
      return {
        tag: "Erster Eindruck",
        title: listing.title || listing.address,
        text: `${listing.address}, ${listing.city}`,
        image: photo.url,
      };
    }
    if (i === total - 1) {
      return {
        tag: "Ihr neues Zuhause",
        title: "Stellen Sie sich vor, hier zu leben",
        text: listing.price_chf ? `${formatChf(listing.price_chf)} — jetzt Besichtigung anfragen.` : "Jetzt Besichtigung anfragen.",
        image: photo.url,
        cta: true,
      };
    }
    const caption = MIDDLE_CAPTIONS[(i - 1) % MIDDLE_CAPTIONS.length];
    return { ...caption, image: photo.url };
  });
}

export function ListingFlythrough({
  listing,
}: {
  listing: {
    title: string | null;
    address: string;
    city: string;
    price_chf: number | null;
    photos: Photo[];
  };
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [slides] = useState(() => buildSlides(listing, listing.photos));

  useEffect(() => {
    if (slides.length < 3) return;
    gsap.registerPlugin(ScrollTrigger);
    const total = slides.length;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      if (!track) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * total}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const x = -self.progress * (total - 1) * window.innerWidth;
          gsap.set(track, { x });
          const idx = Math.round(-x / window.innerWidth);
          setActive(idx);
          boxRefs.current.forEach((box, i) => {
            if (!box) return;
            gsap.to(box, {
              opacity: i === idx ? 1 : 0,
              y: i === idx ? 0 : 24,
              duration: 0.4,
              ease: "power2.out",
            });
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [slides]);

  if (slides.length < 3) return null;

  return (
    <div ref={sectionRef} className="relative bg-ink">
      <div className="relative h-[100svh] overflow-hidden">
        <div ref={trackRef} className="flex h-full will-change-transform">
          {slides.map((slide, i) => (
            <div key={`${slide.image}-${i}`} className="relative h-full w-screen shrink-0 overflow-hidden">
              <Image src={slide.image} alt="" aria-hidden fill sizes="100vw" unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
              <div className="grain absolute inset-0" />
              <span className="absolute left-6 top-6 z-10 font-mono text-xs uppercase tracking-[0.24em] text-ivory-dim/60 lg:left-10 lg:top-10">
                — {slide.tag}
              </span>
              <div className={`absolute inset-0 z-10 flex items-center px-6 lg:px-20 ${slide.cta ? "justify-center text-center" : "justify-start"}`}>
                <div
                  ref={(el) => {
                    boxRefs.current[i] = el;
                  }}
                  className="max-w-lg rounded-2xl border border-line bg-ink/70 p-8 opacity-0 backdrop-blur-md lg:p-11"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <div className={`mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-amber ${slide.cta ? "justify-center" : ""}`}>
                    <span className="h-px w-5 bg-amber" aria-hidden />
                    {slide.tag}
                  </div>
                  <h3 className="font-display text-3xl font-semibold leading-tight text-ivory lg:text-4xl">{slide.title}</h3>
                  <p className="mt-4 text-balance text-ivory-dim">{slide.text}</p>
                  {i === 0 && (
                    <p className="mt-4 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
                      <MapPin className="h-3.5 w-3.5 text-amber" strokeWidth={1.5} />
                      {listing.city}
                    </p>
                  )}
                  {slide.cta && (
                    <div className="mt-7 flex justify-center">
                      <MagneticButton href="#anfragen">Jetzt Besichtigung anfragen</MagneticButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          <span className="font-display text-xl font-semibold text-amber">{String(active + 1).padStart(2, "0")}</span>
          <span className="h-px w-16 overflow-hidden bg-line">
            <span className="block h-full bg-amber transition-[width] duration-300 ease-out" style={{ width: `${((active + 1) / slides.length) * 100}%` }} />
          </span>
          <span className="font-sans text-sm text-ivory-dim/60">/ {String(slides.length).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}
