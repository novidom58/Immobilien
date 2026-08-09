import { Search, Megaphone, Handshake, FileCheck } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Bewertung",
    text: "Persönliches Gespräch vor Ort, fundierte Marktanalyse und ein realistischer, marktgerechter Verkaufspreis.",
  },
  {
    n: "02",
    icon: Megaphone,
    title: "Vermarktung",
    text: "Profi-Fotografie, modernes Exposé, 3D-Rundgang und gezielte Strategie über die richtigen Kanäle.",
  },
  {
    n: "03",
    icon: Handshake,
    title: "Verkauf",
    text: "Qualifizierte Interessenten, professionelle Verhandlung und ein Kaufvertrag, der Ihre Interessen schützt.",
  },
  {
    n: "04",
    icon: FileCheck,
    title: "Notartermin",
    text: "Persönliche Begleitung bis zur Beurkundung — klare Kommunikation bis zum erfolgreichen Abschluss.",
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

        <div className="relative mt-14">
          {/* Verbindungslinie auf Desktop */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-line lg:block" aria-hidden />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <div className="relative">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber/40 bg-ink">
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
