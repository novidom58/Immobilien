import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const competences = ["Immobilienverkauf", "Bewertung", "Finanzierung", "Vermarktung"];

// Team auf der Website (Fotos folgen). Peter Hohler kommt später dazu.
const PEOPLE = [
  {
    name: "Walter Binggeli",
    role: "Geschäftsführer · VR-Präsident",
    text: "Führt NoviDom und sorgt dafür, dass Sie vom ersten Gespräch bis zum Notartermin gut begleitet sind.",
    email: "walter.binggeli@novidom-immo.ch",
  },
  {
    name: "Nicolaj Saric",
    role: "Leiter Bauabteilung · Geschäftsleitung",
    text: "Leitet die Bauabteilung: Umbau, Renovation und der Zustand Ihrer Liegenschaft.",
    email: "nicolaj.saric@novidom-immo.ch",
  },
  {
    name: "Katharine Schaad",
    role: "Finanzen",
    text: "Hat die Finanzen im Blick, für klare Zahlen und saubere Abrechnungen.",
    email: "katharine.schaad@novidom-immo.ch",
  },
  {
    name: "Jana Schnuderl",
    role: "Immobilienmaklerin",
    text: "Begleitet Verkäufer und Käufer persönlich, von der Besichtigung bis zur Schlüsselübergabe.",
    email: "jana.schnuderl@novidom-immo.ch",
  },
];

const stats = [
  { value: "500+", label: "Bewertungen" },
  { value: "20+", label: "Jahre Praxis" },
  { value: "ab 0.95%", label: "Provision" },
];

export function AboutJana() {
  return (
    <section id="ueber-uns" className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Köpfe hinter NoviDom</SectionLabel>

        <div className="mt-10">
          <Reveal delay={0.1}>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Unser Team
            </h2>
            <p className="mt-2 font-mono text-sm uppercase tracking-widest text-blueprint">
              NoviDom Immobilien AG · Basel &amp; Zug
            </p>
            <p className="mt-8 max-w-2xl text-balance text-lg text-ivory-dim">
              Hinter NoviDom steht ein erfahrenes Team mit Kompetenzen in
              Immobilienverkauf, Immobilienbewertung, Finanzierung und
              digitaler Vermarktung. Gemeinsam begleiten wir unsere Kunden
              persönlich und professionell vom ersten Gespräch bis zum
              erfolgreichen Abschluss.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs uppercase tracking-widest text-blueprint">
              {competences.map((c, i) => (
                <span key={c} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="text-ivory-dim/30">·</span>}
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-5 max-w-2xl text-balance text-lg text-ivory-dim">
              Was uns unterscheidet: Wir denken Immobilienverkauf und
              Finanzierung zusammen. Käufer werden direkt auf ihre
              Finanzierungsfähigkeit geprüft — kein Zeitverlust, mehr
              Sicherheit für Sie. Persönlich, unkompliziert und immer
              erreichbar, bis zum Notartermin.
            </p>

            <div className="mt-10 flex gap-10">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-semibold text-amber lg:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-ivory-dim">{stat.label}</div>
                </div>
              ))}
            </div>

            <Link
              href="/karriere"
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-amber/40 px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:border-amber hover:bg-amber/10"
            >
              Teil vom Team werden
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
            </Link>
          </Reveal>
        </div>

        {/* Team wie bei HypoCasa: Bildfläche «Foto folgt», darunter Name, Funktion, kurzer Satz */}
        <Reveal delay={0.15}>
          <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PEOPLE.map((p, i) => (
              <li key={p.name} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
                <div className={`flex aspect-[4/5] flex-col items-center justify-center gap-3 ${i === 0 ? "bg-amber/15 text-amber" : "bg-ink-3 text-ivory-dim"}`}>
                  <User className="h-9 w-9" strokeWidth={1.5} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em]">Foto folgt</span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="font-display text-xl text-ivory">{p.name}</div>
                  <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-amber">{p.role}</div>
                  <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{p.text}</p>
                  <a href={`mailto:${p.email}`} title={p.email} className="mt-auto pt-4 text-sm font-semibold text-amber hover:underline">
                    E-Mail schreiben →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
