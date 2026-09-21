import { Landmark } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

export function FinancingPartner() {
  return (
    <section className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal>
            <SectionLabel>Finanzierung</SectionLabel>
            <h2 className="mt-6 max-w-xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Verkauf und Finanzierung
              <br />
              <span className="text-amber-soft">aus einer Hand.</span>
            </h2>
            <p className="mt-6 max-w-xl text-balance text-lg text-ivory-dim">
              Ein erfolgreicher Immobilienverkauf endet nicht bei der Suche
              nach dem passenden Käufer. Entscheidend ist auch, dass die
              Finanzierung sichergestellt ist.
            </p>
            <p className="mt-5 max-w-xl text-balance text-lg text-ivory-dim">
              Für Finanzierungsfragen arbeiten wir mit Hypocasa zusammen.
              Kaufinteressenten können dadurch bei Bedarf frühzeitig ihre
              Finanzierungsmöglichkeiten prüfen lassen und bei der Suche nach
              einer passenden Hypothekarlösung begleitet werden.
            </p>
            <p className="mt-5 max-w-xl text-balance text-lg text-ivory-dim">
              Für Verkäufer bedeutet das: qualifiziertere Kaufinteressenten,
              mehr Sicherheit im Verkaufsprozess und kurze Wege zwischen
              Immobilienverkauf und Finanzierung.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="lg:mt-11">
            <div className="rounded-2xl border border-line bg-ink p-8 lg:p-10">
              <Landmark className="h-8 w-8 text-amber" strokeWidth={1.5} />
              <div className="mt-4 font-display text-xl font-semibold text-ivory">
                Finanzierungspartner: Hypocasa
              </div>
              <div className="mt-1 text-sm text-ivory-dim">
                Hypothekenberatung &amp; Finanzierungsvermittlung
              </div>
              <a
                href="https://hypocasa.ch"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block rounded-full border border-amber/50 px-6 py-3 font-mono text-xs uppercase tracking-wide text-amber transition-colors hover:bg-amber hover:text-ink"
              >
                Mehr über Hypocasa erfahren →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
