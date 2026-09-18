import { CheckSquare } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const checklist = [
  "Grundbuchauszug (nicht älter als 3 Monate)",
  "Gebäudeversicherungsausweis",
  "Grundriss- und Katasterplan mit Nettowohnfläche",
  "Aktuelle Fotos oder ein erster Eindruck der Räume",
  "Angaben zu Baujahr, Zustand und durchgeführten Renovationen",
  "Bei Stockwerkeigentum: Reglement und aktueller Stand des Erneuerungsfonds",
];

export function Preparation() {
  return (
    <section className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <SectionLabel>So bereiten Sie sich vor</SectionLabel>
            <h2 className="mt-6 max-w-lg text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Diese Unterlagen
              <br />
              <span className="text-amber-soft">beschleunigen den Start.</span>
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
              Für das erste Gespräch brauchen Sie noch nichts vorzubereiten —
              wir klären das gemeinsam. Sobald es an die Vermarktung geht,
              helfen diese Unterlagen, schneller zu starten:
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-line bg-ink p-7 lg:p-8">
              <ul className="space-y-4">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ivory-dim">
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-ivory-dim/60">
                Fehlt etwas davon? Kein Problem — wir helfen bei der Beschaffung, das
                gehört zu unserem Service dazu.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
