import { UserCheck, RefreshCw, TrendingUp } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const pillars = [
  {
    icon: UserCheck,
    title: "Käuferprüfung",
    text: "Jede Kaufinteressentin wird vorab auf Finanzierbarkeit geprüft — Sie verhandeln nur mit Menschen, die sich Ihr Objekt leisten können.",
  },
  {
    icon: RefreshCw,
    title: "Anschlussfinanzierung",
    text: "Beim Verkauf begleiten wir die Ablösung oder den Übertrag Ihrer bestehenden Hypothek — inklusive Prüfung der Vorfälligkeitsentschädigung.",
  },
  {
    icon: TrendingUp,
    title: "Hypothek für Käufer",
    text: "Käufer erhalten über die Plattform einen unabhängigen Vergleich von über 40 Banken und Versicherungen — das beschleunigt Ihren Abschluss.",
  },
];

export function Partnership() {
  return (
    <section id="hypothek" className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>In Zusammenarbeit mit hypotheken-analyse.ch</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          Verkauf &amp; Finanzierung <span className="text-amber-soft">aus einer Hand</span>.
        </h2>
        <p className="mt-5 max-w-2xl text-balance text-lg text-ivory-dim">
          Ein Immobilienverkauf ist fast immer auch eine Finanzierungsfrage.
          Darum arbeiten wir fest mit der unabhängigen Hypothekenberatung
          hypotheken-analyse.ch zusammen — für Verkäufer wie Käufer.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-line bg-ink-2 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blueprint/10">
                  <pillar.icon className="h-5 w-5 text-blueprint" strokeWidth={1.5} />
                </div>
                <div className="mt-6 font-display text-xl font-semibold text-ivory">
                  {pillar.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <a
            href="https://www.hypotheken-analyse.ch"
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-block rounded-full border border-blueprint/50 px-6 py-3 font-mono text-xs uppercase tracking-wider text-blueprint transition-colors hover:bg-blueprint hover:text-ink"
          >
            Zur Partnerplattform →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
