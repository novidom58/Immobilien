"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";

const steps = [
  {
    n: "01",
    title: "Bewertung",
    text: "Persönliches Gespräch vor Ort, fundierte Marktanalyse und ein realistischer, marktgerechter Verkaufspreis für Ihre Immobilie.",
  },
  {
    n: "02",
    title: "Vermarktung",
    text: "Professionelle Fotografie, moderne Exposés, digitale Besichtigungstools und eine gezielte Strategie über die richtigen Kanäle.",
  },
  {
    n: "03",
    title: "Verkauf",
    text: "Qualifizierte Interessenten, professionelle Verhandlungsführung und ein Kaufvertrag, der Ihre Interessen bestmöglich schützt.",
  },
  {
    n: "04",
    title: "Notartermin",
    text: "Persönliche Begleitung bis zur Beurkundung — klare Kommunikation, bis der Verkauf erfolgreich abgeschlossen ist.",
  },
];

export function Process() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".process-step");
      items.forEach((item, i) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="prozess" ref={sectionRef} className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Ihr Weg zum Verkauf</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          Vier Schritte. Ein persönlicher Ansprechpartner.
        </h2>

        <div className="mt-16 grid gap-16 lg:grid-cols-[280px_1fr] lg:gap-24">
          <div className="hidden lg:block">
            <div className="sticky top-32 flex flex-col gap-4">
              {steps.map((step, i) => (
                <div
                  key={step.n}
                  className={`flex items-center gap-4 border-l-2 py-2 pl-5 transition-colors duration-500 ${
                    active === i ? "border-amber" : "border-line"
                  }`}
                >
                  <span
                    className={`font-mono text-xs transition-colors duration-500 ${
                      active === i ? "text-amber" : "text-ivory-dim/50"
                    }`}
                  >
                    {step.n}
                  </span>
                  <span
                    className={`font-display text-sm font-medium transition-colors duration-500 ${
                      active === i ? "text-ivory" : "text-ivory-dim/50"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-24 lg:gap-40">
            {steps.map((step) => (
              <div key={step.n} className="process-step min-h-[40vh] lg:min-h-[50vh]">
                <span className="font-mono text-sm text-blueprint lg:hidden">
                  {step.n}
                </span>
                <h3 className="mt-2 font-display text-3xl font-semibold text-ivory lg:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-5 max-w-lg text-balance text-lg text-ivory-dim">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
