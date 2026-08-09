"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, Megaphone, Handshake, FileCheck } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Bewertung",
    text: "Persönliches Gespräch vor Ort, fundierte Marktanalyse und ein realistischer, marktgerechter Verkaufspreis für Ihre Immobilie.",
  },
  {
    n: "02",
    icon: Megaphone,
    title: "Vermarktung",
    text: "Professionelle Fotografie, moderne Exposés, digitale Besichtigungstools und eine gezielte Strategie über die richtigen Kanäle.",
  },
  {
    n: "03",
    icon: Handshake,
    title: "Verkauf",
    text: "Qualifizierte Interessenten, professionelle Verhandlungsführung und ein Kaufvertrag, der Ihre Interessen bestmöglich schützt.",
  },
  {
    n: "04",
    icon: FileCheck,
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
            <div className="sticky top-32 flex flex-col">
              <div className="relative flex flex-col gap-8 pl-1">
                <div className="absolute bottom-2 left-1 top-2 w-px bg-line" aria-hidden />
                <div
                  className="absolute left-1 top-2 w-px bg-amber transition-[height] duration-500 ease-out"
                  style={{ height: `${(active / (steps.length - 1)) * 100}%` }}
                  aria-hidden
                />
                {steps.map((step, i) => (
                  <div key={step.n} className="relative flex items-center gap-4 pl-5">
                    <span
                      className={`absolute -left-[7px] h-[15px] w-[15px] rounded-full border-2 transition-colors duration-500 ${
                        active === i
                          ? "border-amber bg-amber"
                          : active > i
                            ? "border-amber bg-ink-2"
                            : "border-line bg-ink-2"
                      }`}
                    />
                    <step.icon
                      className={`h-4 w-4 shrink-0 transition-colors duration-500 ${
                        active === i ? "text-amber" : "text-ivory-dim/40"
                      }`}
                      strokeWidth={1.5}
                    />
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
          </div>

          <div className="flex flex-col gap-24 lg:gap-32">
            {steps.map((step) => (
              <div key={step.n} className="process-step flex min-h-[36vh] flex-col justify-center lg:min-h-[42vh]">
                <Reveal>
                  <div className="flex items-center gap-4 lg:hidden">
                    <span className="font-mono text-sm text-blueprint">{step.n}</span>
                    <step.icon className="h-5 w-5 text-amber" strokeWidth={1.5} />
                  </div>
                  <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-line bg-ink lg:flex">
                    <step.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-semibold text-ivory lg:mt-6 lg:text-4xl">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-lg text-balance text-lg text-ivory-dim">
                    {step.text}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
