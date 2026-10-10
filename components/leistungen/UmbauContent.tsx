import Link from "next/link";
import { ArrowRight, Sofa } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

// Richtwerte für die Region Basel/Zug, inkl. MwSt. Sie dienen der ersten
// Orientierung und ersetzen keine Offerte.
const PROJECTS = [
  { title: "Küche ersetzen", range: "CHF 25'000 – 60'000", text: "Neue Fronten, Geräte und Abdeckung. Oft mit offenem Grundriss zum Wohnbereich." },
  { title: "Bad sanieren", range: "CHF 25'000 – 50'000", text: "Bodenebene Dusche, neue Leitungen, Platten und Möbel. Meist drei bis vier Wochen." },
  { title: "Heizung ersetzen", range: "CHF 35'000 – 60'000", text: "Wärmepumpe statt Öl oder Gas. Für viele Anlagen gibt es Förderbeiträge." },
  { title: "Photovoltaik", range: "CHF 20'000 – 35'000", text: "Eigener Strom vom Dach, optional mit Batterie und Ladestation fürs Auto." },
  { title: "Fenster & Dämmung", range: "ab CHF 40'000", text: "Weniger Energieverlust, mehr Komfort. Die Gebäudehülle ist der grösste Hebel." },
  { title: "Dach- oder Estrichausbau", range: "ab CHF 80'000", text: "Zusätzliche Wohnfläche ohne Umzug. Bewilligung und Statik klären wir früh." },
];

const STEPS = [
  { title: "Erstgespräch & Begehung", text: "Wir hören zu, schauen uns das Objekt an und halten Wünsche, Zustand und Budget fest." },
  { title: "Konzept & Kostenschätzung", text: "Sie erhalten eine Grobplanung mit Varianten und einer ehrlichen Kostenschätzung." },
  { title: "Offerten & Vergleich", text: "Mindestens zwei Offerten pro Gewerk aus unserem Partnernetz, vergleichbar aufbereitet." },
  { title: "Finanzierung & Förderung", text: "Hypothek aufstocken, Förderbeiträge beantragen und steuerliche Abzüge planen." },
  { title: "Umsetzung & Abnahme", text: "Terminplan, Baustellenkoordination und eine saubere Abnahme mit Mängelliste." },
];

const FUNDING = [
  {
    title: "Das Gebäudeprogramm",
    text: "Bund und Kantone fördern Wärmedämmung, Heizungsersatz und Gesamtsanierungen. Das Gesuch muss vor Baubeginn eingereicht werden.",
  },
  {
    title: "Kantonale Programme",
    text: "Basel-Stadt, Basel-Landschaft und Zug haben eigene Beiträge, zum Beispiel für Wärmepumpen oder Solaranlagen. Wir prüfen, was für Ihr Objekt gilt.",
  },
  {
    title: "Steuern sparen",
    text: "Werterhaltende und energetische Massnahmen sind in der Regel vom Einkommen abziehbar. Wertvermehrende Investitionen zählen später bei der Grundstückgewinnsteuer.",
  },
  {
    title: "GEAK als Grundlage",
    text: "Der Gebäudeenergieausweis zeigt, wo Ihr Haus Energie verliert, und ist für manche Förderungen Voraussetzung.",
  },
];

export function UmbauContent() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <SectionLabel>Typische Projekte</SectionLabel>
        <h2 className="mb-3 mt-6 font-display text-3xl text-ivory lg:text-4xl">
          Was kostet <em>was?</em>
        </h2>
        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-ivory-dim">
          Richtwerte inkl. MwSt. für die Region Basel und Zug. Der genaue Betrag hängt vom Objekt und vom Ausbaustandard ab.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-line bg-white p-6">
              <div className="font-display text-xl text-ivory">{p.title}</div>
              <div className="mt-1 font-mono text-xs tracking-[0.08em] text-amber">{p.range}</div>
              <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-2 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <SectionLabel>So läuft es ab</SectionLabel>
          <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
            In fünf Schritten <em>zum fertigen Umbau.</em>
          </h2>
          <ol className="grid gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-5 border-t border-line pt-6">
                <span className="font-display text-3xl leading-none text-amber">{i + 1}</span>
                <div>
                  <div className="font-display text-xl text-ivory">{s.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-ivory-dim">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionLabel>Förderung &amp; Steuern</SectionLabel>
        <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
          Geld, das viele <em>liegen lassen.</em>
        </h2>
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {FUNDING.map((f) => (
            <div key={f.title} className="border-t border-line pt-6">
              <h3 className="font-display text-xl text-ivory">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24 lg:px-10">
        <div className="flex flex-col items-start gap-6 rounded-[28px] bg-night p-8 text-ink sm:flex-row sm:items-center sm:justify-between lg:p-12">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-soft">
              <Sofa className="h-4 w-4" strokeWidth={1.5} />
              Neu: Grundriss-Planer
            </div>
            <h2 className="mt-3 font-display text-2xl lg:text-3xl">Ideen direkt am Grundriss ausprobieren.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/75">
              Möbel massstabsgetreu platzieren, Räume neu denken und die Idee mit einem Klick an uns schicken. Auf dem Handy und am Computer.
            </p>
          </div>
          <Link
            href="/dashboard/planer/demo"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-soft"
          >
            Planer öffnen
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </>
  );
}
