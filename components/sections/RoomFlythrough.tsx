"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "@/components/ui/MagneticButton";

const rooms = [
  {
    key: "eingang",
    label: "Eingang",
    tag: "Der erste Eindruck",
    title: "Wo alles beginnt",
    text: "Ein einladender Empfang mit natürlichen Materialien setzt den Ton für das gesamte Zuhause.",
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260724_172033_240313c6-3332-42be-b381-08181cd212e4.png",
    align: "left" as const,
  },
  {
    key: "wohnzimmer",
    label: "Wohnzimmer",
    tag: "Zum Wohlfühlen",
    title: "Wo sich Zuhause anfühlt",
    text: "Grosszügige Räume mit viel Licht — der Mittelpunkt für Familie und Gäste.",
    image: null,
    align: "right" as const,
  },
  {
    key: "kueche",
    label: "Küche",
    tag: "Der Alltag",
    title: "Der Mittelpunkt des Alltags",
    text: "Durchdachtes Design trifft auf hochwertige Materialien.",
    image: null,
    align: "left" as const,
  },
  {
    key: "aussenbereich",
    label: "Aussenbereich",
    tag: "Zur Dämmerung",
    title: "Ihr Zuhause, wenn es zum Leben erwacht",
    text: "Warmes Licht, ruhige Atmosphäre — der Moment, der zeigt, was möglich ist.",
    image:
      "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221242_dc36129e-cfa1-44b7-8b76-e01581d1c775.png",
    align: "center" as const,
    cta: true,
  },
];

export function RoomFlythrough() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const total = rooms.length;

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
  }, []);

  return (
    <div ref={sectionRef} className="relative bg-ink">
      <div className="relative h-[100svh] overflow-hidden">
        <div ref={trackRef} className="flex h-full will-change-transform">
          {rooms.map((room, i) => (
            <div key={room.key} className="relative h-full w-screen shrink-0 overflow-hidden">
              {room.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- external CDN room photo
                <img
                  src={room.image}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-ink-3 via-ink-2 to-ink" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
              <div className="grain absolute inset-0" />

              <span className="absolute left-6 top-6 z-10 font-mono text-xs uppercase tracking-[0.24em] text-ivory-dim/60 lg:left-10 lg:top-10">
                — {room.label}
              </span>

              <div
                className={`absolute inset-0 z-10 flex items-center px-6 lg:px-20 ${
                  room.align === "right"
                    ? "justify-end text-right"
                    : room.align === "center"
                      ? "justify-center text-center"
                      : "justify-start"
                }`}
              >
                <div
                  ref={(el) => {
                    boxRefs.current[i] = el;
                  }}
                  className="max-w-lg rounded-2xl border border-line bg-ink/70 p-8 opacity-0 backdrop-blur-md lg:p-11"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <div
                    className={`mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-amber ${
                      room.align === "center" ? "justify-center" : ""
                    }`}
                  >
                    <span className="h-px w-5 bg-amber" aria-hidden />
                    {room.tag}
                  </div>
                  <h3 className="font-display text-3xl font-semibold leading-tight text-ivory lg:text-4xl">
                    {room.title}
                  </h3>
                  <p className="mt-4 text-balance text-ivory-dim">{room.text}</p>
                  {room.cta && (
                    <div className="mt-7 flex justify-center">
                      <MagneticButton href="#kontakt">
                        Jetzt kostenlose Bewertung sichern
                      </MagneticButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          <span className="font-display text-xl font-semibold text-amber">
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-16 overflow-hidden bg-line">
            <span
              className="block h-full bg-amber transition-[width] duration-300 ease-out"
              style={{ width: `${((active + 1) / rooms.length) * 100}%` }}
            />
          </span>
          <span className="font-sans text-sm text-ivory-dim/60">
            / {String(rooms.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
