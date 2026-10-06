"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BlueprintHouse } from "@/components/novidom360/BlueprintHouse";

const STAGES = [
  { kicker: "Ausgangslage", title: "Eine Immobilie.", text: "Jede Geschichte beginnt mit einem Haus. Ihrem." },
  { kicker: "Bewertung", title: "Was ist sie wert?", text: "Bankanerkannte Bewertung durch IAZI und Wüest Partner. Kostenlos und unverbindlich." },
  { kicker: "Verkauf & Kauf", title: "Wir verkaufen & vermitteln.", text: "360°-Rundgang, Portale, Besichtigungen. Käufer werden vorab auf Finanzierbarkeit geprüft." },
  { kicker: "Umbau", title: "Wir verändern sie.", text: "Ein Ansprechpartner koordiniert Planung, Handwerker und Termine." },
  { kicker: "Finanzierung", title: "Wir finanzieren sie.", text: "Gemeinsam mit Hypocasa zur passenden Hypothek, parallel zum Kauf." },
  { kicker: "Versicherung", title: "Wir schützen sie.", text: "Gebäude, Hausrat, Haftpflicht. Wir prüfen, was Ihr Zuhause wirklich braucht." },
  { kicker: "Zuhause", title: "Ihr fertiges Zuhause.", text: "Von der ersten Idee bis zum Einzug. Eine Begleitung, ein Ansprechpartner." },
];

const HUD = [
  "left-3 top-3 border-l border-t",
  "right-3 top-3 border-r border-t",
  "left-3 bottom-3 border-l border-b",
  "right-3 bottom-3 border-r border-b",
];

export function HouseJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${window.innerHeight * 3}`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          setStage(Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length)));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const current = STAGES[stage];

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative flex h-[100svh] min-h-[560px] items-center overflow-hidden bg-ink px-6 py-16 lg:px-10 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.24em] text-blueprint">{current.kicker}</div>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:mt-4 lg:min-h-[2.2em] lg:text-5xl">
            {current.title}
          </h2>
          <p className="mt-3 max-w-md text-balance leading-relaxed text-ivory-dim lg:mt-4 lg:min-h-[5em] lg:text-lg">{current.text}</p>

          <ol className="mt-8 hidden flex-col gap-0.5 lg:flex">
            {STAGES.map((s, i) => (
              <li key={s.kicker}>
                <button
                  type="button"
                  onClick={() => setStage(i)}
                  aria-current={i === stage ? "step" : undefined}
                  className={`flex items-center gap-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                    i === stage ? "text-ivory" : "text-ivory-dim/40 hover:text-ivory-dim"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full border transition-all ${
                      i === stage
                        ? "border-amber bg-amber shadow-[0_0_0_4px_rgba(232,168,85,0.15)]"
                        : i < stage
                          ? "border-blueprint bg-blueprint"
                          : "border-line bg-ink-3"
                    }`}
                  />
                  {s.kicker}
                </button>
              </li>
            ))}
          </ol>
          <p
            className={`mt-6 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-dim/40 transition-opacity lg:block ${
              stage > 0 ? "opacity-0" : "opacity-100"
            }`}
          >
            Scrollen ↓
          </p>
        </div>

        <div className="relative mx-auto aspect-[5/4] w-full max-w-md rounded-3xl border border-line bg-[radial-gradient(circle_at_50%_40%,#151b27,var(--color-ink))] p-5 lg:max-w-none">
          {HUD.map((pos) => (
            <span key={pos} aria-hidden className={`absolute h-6 w-6 border-blueprint/50 ${pos}`} />
          ))}
          <BlueprintHouse stage={stage} label={`Haus, Stufe: ${current.kicker}`} />
        </div>
      </div>
    </section>
  );
}
