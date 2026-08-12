import { Reveal } from "@/lib/reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function WhyNoviDom() {
  return (
    <section id="warum" className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionLabel>Die Idee dahinter</SectionLabel>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Kein klassischer Makler.
              <br />
              Ein neuer Standard für{" "}
              <span className="text-amber-soft">Ihr Zuhause</span>.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-8">
              <div className="flex gap-6">
                <span className="font-display text-4xl font-semibold text-blueprint">
                  Novi
                </span>
                <p className="text-balance text-ivory-dim">
                  steht für Neu &amp; Innovation — ein frischer Blick auf den
                  Immobilienmarkt in der Nordwestschweiz.
                </p>
              </div>
              <div className="h-px w-full bg-line" />
              <div className="flex gap-6">
                <span className="font-display text-4xl font-semibold text-amber-soft">
                  Dom
                </span>
                <p className="text-balance text-ivory-dim">
                  steht für Zuhause (lat. <em>domus</em>) — ein Ort, an dem
                  Menschen leben, sich wohlfühlen und ihre Zukunft aufbauen.
                </p>
              </div>
              <p className="text-balance text-ivory-dim">
                Genau so ist NoviDom gedacht: als Partner, der Eigentümer beim
                Verkauf ihrer Immobilie begleitet — mit Klarheit, Fairness und
                persönlicher Betreuung, vom ersten Bewertungsgespräch bis zum
                Notartermin.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
