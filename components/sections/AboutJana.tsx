import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const certs = [
  "Eidg. dipl. Kauffrau",
  "IAZI-zertifiziert",
  "Giraffe360",
  "20+ J. Bankerfahrung",
];

const competences = ["Immobilienverkauf", "Bewertung", "Finanzierung", "Vermarktung"];

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

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-24">
          <Reveal>
            <div className="relative flex aspect-[4/5] w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-ink-3 via-ink-2 to-ink">
              <span className="font-display text-6xl font-semibold text-ivory/15">
                ND
              </span>
              <div className="grain absolute inset-0" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Unser Team
            </h2>
            <p className="mt-2 font-mono text-sm uppercase tracking-widest text-blueprint">
              NoviDom Immo · Basel &amp; Zug
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

            <div className="mt-8 flex flex-wrap gap-2">
              {certs.map((cert) => (
                <span
                  key={cert}
                  className="rounded-full border border-amber/30 px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-amber-soft"
                >
                  {cert}
                </span>
              ))}
            </div>

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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
