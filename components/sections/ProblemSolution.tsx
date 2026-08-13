import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const problems = [
  {
    title: "Falscher Verkaufspreis kostet Zehntausende",
    text: "Wer den Wert seiner Immobilie nicht kennt, verkauft zu günstig — oder scheitert mit einem zu hohen Preis. Ohne bankanerkannte IAZI-Bewertung ist jeder Preis ein Ratespiel.",
  },
  {
    title: "Schlechte Vermarktung = monatelanges Warten",
    text: "Ein einziges Inserat reicht nicht. Ohne Matterport-3D-Rundgang und professionelle Fotos verpufft das Interesse nach wenigen Tagen.",
  },
  {
    title: "Unqualifizierte Käufer verschwenden Ihre Zeit",
    text: "Besichtigungen mit Interessenten, die sich die Finanzierung gar nicht leisten können. Dank unserer 18-jährigen Hypothekenexpertise prüfen wir Käufer vorab auf ihre Finanzierungsfähigkeit.",
  },
  {
    title: "Überhöhte Provision schmälert Ihren Erlös",
    text: "Klassische Makler verlangen 3% — das sind CHF 36'000 bei CHF 1.2 Mio. NoviDom bietet denselben Service für CHF 11'400.",
  },
];

const solutions = [
  "IAZI-Bewertung für den höchstmöglichen Verkaufspreis",
  "Matterport-3D-Rundgang & Fotos inklusive",
  "Käufer werden auf Finanzierbarkeit geprüft",
  "10+ Immobilienportale gleichzeitig",
  "Breite Käuferkartei aus aktiver Hypothekenberatung",
  "Nur 0.95% Provision statt 3%",
  "Keine Knebelverträge, keine versteckten Kosten",
  "100% erfolgsbasiert — kein Verkauf, keine Kosten",
];

const pills = ["Unkompliziert", "Transparent", "Keine versteckten Kosten", "Keine Knebelverträge", "Persönlich"];

export function ProblemSolution() {
  return (
    <section className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionLabel>Das Problem</SectionLabel>
              <h2 className="mt-6 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
                Was beim Immobilien&shy;verkauf oft{" "}
                <span className="text-amber-soft italic">schief geht</span>
              </h2>
              <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
                Viele Eigentümer machen kostspielige Fehler — nicht aus
                Unwissenheit, sondern weil niemand sie rechtzeitig informiert
                hat.
              </p>
            </Reveal>

            <div className="mt-10 space-y-4">
              {problems.map((p, i) => (
                <Reveal key={p.title} delay={0.1 + i * 0.08}>
                  <div className="rounded-xl border border-line bg-ink p-5">
                    <div className="flex gap-4">
                      <span className="font-display text-xl font-semibold text-ivory-dim/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <div className="font-display text-base font-semibold text-ivory">
                          {p.title}
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-ivory-dim">
                          {p.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <Reveal delay={0.1}>
              <SectionLabel>Unsere Lösung</SectionLabel>
              <h2 className="mt-6 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
                Voller Service.
                <br />
                <span className="text-amber-soft italic">Faire Kosten.</span>
              </h2>
              <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
                Wir lösen jedes dieser Probleme — mit Bankexpertise,
                modernster Technologie und einem fairen Preismodell.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 rounded-2xl border border-amber/20 bg-ink p-7 lg:p-8">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-amber">
                  Das NoviDom Versprechen
                </span>
                <p className="mt-3 text-balance font-display text-xl font-semibold leading-snug text-ivory">
                  Maximaler Verkaufspreis. Minimale Provision. Kein Stress.
                </p>
                <ul className="mt-6 space-y-3">
                  {solutions.map((s) => (
                    <li key={s} className="flex items-start gap-3 text-sm text-ivory-dim">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber/20 text-[10px] text-amber-soft">
                        ✓
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {pills.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-line px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-ivory-dim"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
