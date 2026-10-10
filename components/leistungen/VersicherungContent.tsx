import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const SITUATIONS = [
  {
    title: "Ich kaufe",
    items: ["Gebäudeversicherung ab Eigentumsübertragung", "Hausrat neu bewerten", "Risiko-Lebensversicherung für die Hypothek", "Gebäudehaftpflicht beim Einfamilienhaus"],
  },
  {
    title: "Ich baue um",
    items: ["Bauherrenhaftpflicht", "Bauwesenversicherung", "Versicherungswert nach dem Umbau anpassen", "Rechtsschutz für Streit mit Handwerkern"],
  },
  {
    title: "Ich wohne im Eigentum",
    items: ["Unterversicherung vermeiden", "Glas- und Gebäudewasser prüfen", "Erdbeben-Deckung abwägen", "Policen alle drei bis fünf Jahre vergleichen"],
  },
  {
    title: "Ich vermiete",
    items: ["Gebäudehaftpflicht als Vermieter", "Mietzinsausfall", "Rechtsschutz für Mietstreitigkeiten", "Hausrat bleibt Sache der Mieter"],
  },
];

const COVERAGE = [
  {
    name: "Gebäudeversicherung",
    covers: "Feuer und Elementarschäden wie Sturm, Hagel und Hochwasser am Gebäude.",
    note: "In Basel-Stadt, Basel-Landschaft und Zug obligatorisch über die kantonale Gebäudeversicherung.",
  },
  {
    name: "Gebäudewasser & Glas",
    covers: "Leitungswasser, Rückstau und Glasbruch am Gebäude.",
    note: "Nicht in der kantonalen Versicherung enthalten, separat abschliessen.",
  },
  {
    name: "Gebäudehaftpflicht",
    covers: "Schäden, die Dritte durch Ihr Gebäude erleiden, zum Beispiel durch Dachlawinen oder vereiste Wege.",
    note: "Beim Einfamilienhaus wichtig, bei Stockwerkeigentum meist über die Gemeinschaft.",
  },
  {
    name: "Hausrat",
    covers: "Möbel, Kleider und Geräte bei Feuer, Wasser, Diebstahl und Elementarschäden.",
    note: "Versicherungssumme nach dem Umzug anpassen, sonst droht Unterversicherung.",
  },
  {
    name: "Bauherrenhaftpflicht & Bauwesen",
    covers: "Schäden an Dritten und am Bauwerk während der Bauzeit.",
    note: "Ab grösseren Umbauten sinnvoll, oft schon vor Baubeginn verlangt.",
  },
  {
    name: "Risiko-Lebensversicherung",
    covers: "Sichert Familie und Hypothek ab, wenn ein Einkommen wegfällt.",
    note: "Kann über die Säule 3a laufen und Steuern sparen.",
  },
  {
    name: "Erdbeben",
    covers: "Schäden durch Erdbeben am Gebäude.",
    note: "In der Regel nicht oder nur begrenzt gedeckt. Gerade in der Region Basel prüfenswert.",
  },
];

export function VersicherungContent() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <SectionLabel>Ihre Situation</SectionLabel>
        <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
          Was Sie jetzt <em>wirklich brauchen.</em>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SITUATIONS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-line bg-white p-6">
              <div className="font-display text-xl text-ivory">{s.title}</div>
              <ul className="mt-4 grid gap-2.5">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-ivory-dim">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink-2 py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <SectionLabel>Deckungen im Überblick</SectionLabel>
          <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
            Rund ums Wohneigentum <em>verständlich erklärt.</em>
          </h2>
          <div className="divide-y divide-line border-y border-line">
            {COVERAGE.map((c) => (
              <div key={c.name} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-8">
                <div className="font-display text-lg text-ivory">{c.name}</div>
                <div>
                  <p className="text-sm leading-relaxed text-ivory">{c.covers}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ivory-dim">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-24 lg:px-10">
        <div className="flex flex-col items-start gap-6 rounded-[28px] bg-night p-8 text-ink sm:flex-row sm:items-center sm:justify-between lg:p-12">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-soft">In 2 Minuten</div>
            <h2 className="mt-3 font-display text-2xl lg:text-3xl">Versicherungs-Check im Kundenportal.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/75">
              Ein paar Fragen zu Ihrem Zuhause, und Sie sehen sofort, welche Deckungen passen und wo Lücken sein könnten.
            </p>
          </div>
          <Link
            href="/dashboard#versicherung"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-amber-soft"
          >
            Check starten
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </>
  );
}
