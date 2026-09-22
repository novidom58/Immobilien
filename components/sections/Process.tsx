"use client";

import { useRef } from "react";
import { Users, Megaphone, Handshake, FileCheck } from "lucide-react";
import { motion, useScroll } from "motion/react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const steps = [
  {
    n: "01",
    icon: Users,
    title: "Kennenlernen",
    text: "Wir kommen bei Ihnen vorbei, besprechen die realistische Marktwerteinschätzung — dann Fotos und Grundrisse mit Giraffe360 (automatisiertes Rundum-Kamerasystem), professionelle Bildbearbeitung und eine eigene Webseite für Ihr Objekt, startklar in 5–7 Tagen.",
  },
  {
    n: "02",
    icon: Megaphone,
    title: "Vermarktung",
    text: "Sobald alle Bilder online sind: gezielte Schaltung auf den passenden Portalen (inkl. Homegate), Vermarktung über soziale Medien sowie direkter Versand an unsere Kundendatei und die Kundendateien diverser Partnerfirmen — oder diskret off-market, ganz nach Bedarf.",
  },
  {
    n: "03",
    icon: Handshake,
    title: "Besichtigung & Verkauf",
    text: "Sie nennen uns nur die Zeitfenster, in denen Sie ausser Haus sind — Interessenten buchen ihren Termin direkt online, und wir führen die Besichtigungen komplett für Sie durch, inklusive Käuferprüfung und Hypotheken-Vorbereitung.",
  },
  {
    n: "04",
    icon: FileCheck,
    title: "Notartermin & Betreuung",
    text: "Persönliche Begleitung bis zur Beurkundung — und danach Ansprechpartner für Fragen zu Geld und Anlage. Rundum sorglos, ohne Risiko für Käufer und Verkäufer.",
  },
];

export function Process() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.8", "end 0.55"],
  });

  return (
    <section id="prozess" className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <SectionLabel>Ihr Weg zum Verkauf</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          Vier Schritte. Ein persönlicher Ansprechpartner.
        </h2>
        <p className="mt-4 max-w-2xl text-balance text-lg text-ivory-dim">
          Von der ersten Besichtigung bis zur Schlüsselübergabe — und darüber
          hinaus. Unser Rundum-sorglos-Paket, ohne Risiko für Käufer und
          Verkäufer.
        </p>

        <div ref={trackRef} className="relative mt-20">
          <div className="absolute left-8 top-2 bottom-2 w-px bg-line" aria-hidden />
          <motion.div
            style={{ scaleY: scrollYProgress }}
            className="absolute left-8 top-2 bottom-2 w-px origin-top bg-amber"
            aria-hidden
          />

          <div className="flex flex-col gap-16 lg:gap-24">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.05}>
                <div className="relative flex gap-6 lg:gap-10">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-amber/40 bg-ink-2 transition-colors duration-300">
                    <step.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                  </div>
                  <div className="relative flex-1 pb-2 pt-1">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-6 right-0 select-none font-display text-7xl font-bold text-ivory/[0.04] lg:text-8xl"
                    >
                      {step.n}
                    </span>
                    <h3 className="relative font-display text-2xl font-semibold text-ivory lg:text-3xl">
                      {step.title}
                    </h3>
                    <p className="relative mt-3 max-w-lg text-balance text-base leading-relaxed text-ivory-dim lg:text-lg">
                      {step.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
