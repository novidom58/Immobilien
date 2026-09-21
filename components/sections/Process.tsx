"use client";

import { Users, Megaphone, Handshake, FileCheck } from "lucide-react";
import { motion } from "motion/react";
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
  return (
    <section id="prozess" className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Ihr Weg zum Verkauf</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          Vier Schritte. Ein persönlicher Ansprechpartner.
        </h2>
        <p className="mt-4 max-w-2xl text-balance text-lg text-ivory-dim">
          Von der ersten Besichtigung bis zur Schlüsselübergabe — und darüber
          hinaus. Unser Rundum-sorglos-Paket, ohne Risiko für Käufer und
          Verkäufer.
        </p>

        <div className="relative mt-14">
          {/* Verbindungslinie auf Desktop - zeichnet sich beim Scrollen ein */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-7 hidden h-px origin-left bg-line lg:block"
            aria-hidden
          />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <div className="group relative transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber/40 bg-ink transition-colors duration-300 group-hover:border-amber group-hover:bg-amber/10">
                    <step.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                  </div>
                  <div className="mt-5 flex items-baseline gap-3">
                    <span className="font-mono text-xs text-blueprint">{step.n}</span>
                    <h3 className="font-display text-xl font-semibold text-ivory lg:text-2xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-3 max-w-xs text-balance text-sm leading-relaxed text-ivory-dim">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
