"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const faqs = [
  {
    q: "Was kostet mich der Verkauf mit NoviDom?",
    a: "Eine fixe Kommission von 0.95% des Verkaufspreises — erfolgsbasiert. Kommt kein Verkauf zustande, entstehen Ihnen keine Kosten.",
  },
  {
    q: "Was ist in der Kommission enthalten?",
    a: "Eine bankanerkannte IAZI-Bewertung, professionelle Fotografie mit Matterport-3D-Rundgang, die Vermarktung über mehr als 10 Immobilienportale sowie eine Finanzierbarkeitsprüfung der Interessenten.",
  },
  {
    q: "Wie läuft der Verkauf konkret ab?",
    a: "In vier Schritten: persönliche Bewertung vor Ort, professionelle Vermarktung, Verkauf mit qualifizierten Interessenten und persönliche Begleitung bis zum Notartermin.",
  },
  {
    q: "Prüfen Sie, ob Interessenten sich die Immobilie überhaupt leisten können?",
    a: "Ja — die Finanzierbarkeit von Interessenten wird vorab geprüft, bevor es zu einer Besichtigung kommt. Das spart Zeit und schafft Sicherheit.",
  },
  {
    q: "In welchen Gebieten ist NoviDom aktiv?",
    a: "In der gesamten Region Basel — unter anderem Basel-Stadt, Riehen, Bettingen, Binningen, Allschwil, Reinach, Muttenz, Arlesheim, Pratteln und Liestal.",
  },
  {
    q: "Wer begleitet meinen Verkauf persönlich?",
    a: "Jana Schnuderl, Inhaberin von NoviDom Immo, mit über 18 Jahren Erfahrung in Immobilien, Hypotheken und Bankwesen — persönlich und bis zum Notartermin erreichbar.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <SectionLabel>Häufige Fragen</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          Gut zu wissen.
        </h2>

        <div className="mt-12 flex flex-col divide-y divide-line border-y border-line">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-lg font-medium text-ivory">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-amber transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-6 text-balance text-ivory-dim">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
