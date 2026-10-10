import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";

const ROWS: { topic: string; privat: string; novidom: string }[] = [
  { topic: "Preis", privat: "Geschätzt nach Gefühl oder Online-Rechner", novidom: "Bankanerkannte Bewertung, abgeglichen mit echten Verkäufen" },
  { topic: "Vermarktung", privat: "Handyfotos, ein Inserat", novidom: "Profi-Fotos, 360°-Rundgang, Grundriss, Drohnenflug, Portale & Social Media" },
  { topic: "Käufer", privat: "Wer anruft, kommt zur Besichtigung", novidom: "Vorgemerkte Käufer mit Finanzierungs-Pass, Off-Market-Vorverkauf" },
  { topic: "Besichtigungen", privat: "Abende und Wochenenden selber", novidom: "Machen wir, Feedback sehen Sie live im Portal" },
  { topic: "Verhandlung", privat: "Emotional, direkt mit dem Käufer", novidom: "Mit Distanz und Erfahrung, Sie entscheiden" },
  { topic: "Verträge & Notar", privat: "Selber organisieren, Haftungsrisiken", novidom: "Komplett koordiniert bis zur Schlüsselübergabe" },
  { topic: "Kosten", privat: "Keine Provision, aber Inserate, Fotos, Zeit und das Risiko eines tieferen Preises", novidom: "Ab 0.95%, nur bei Erfolg" },
];

const UNIQUE = [
  { title: "Off-Market-Vorverkauf", text: "Ihr Objekt geht zuerst 48 Stunden an vorgemerkte Käufer. Oft ist der passende Käufer schon da, bevor es auf den Portalen steht." },
  { title: "Nur geprüfte Käufer", text: "Mit dem Finanzierungs-Pass wissen Sie vor der Besichtigung, wer sich Ihr Objekt leisten kann." },
  { title: "Feedback nach jeder Besichtigung", text: "Interessenten bewerten per WhatsApp, Sie sehen Preis-Einschätzung und Interesse sofort im Portal." },
  { title: "Alles aus einer Hand", text: "Verkauf, Finanzierung mit HypoCasa, Umbau und Versicherung. Auch für Ihr nächstes Zuhause." },
];

/** «Warum nicht selber verkaufen?» für die Seite Kaufen & Verkaufen. */
export function SellVsPrivate() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
      <SectionLabel>Selber verkaufen?</SectionLabel>
      <h2 className="mt-6 max-w-3xl text-balance font-display text-3xl text-ivory lg:text-5xl">
        Warum sich ein Profi <em>mehr als bezahlt macht.</em>
      </h2>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivory-dim">
        Schon 1% besserer Verkaufspreis sind bei CHF 1.2 Mio. CHF 12&apos;000, mehr als unsere Provision von CHF 11&apos;400. Dazu sparen Sie Zeit,
        Nerven und Haftungsrisiken.
      </p>

      <div className="mt-12 overflow-hidden rounded-[28px] border border-line bg-white">
        <div className="hidden grid-cols-[180px_1fr_1fr] gap-6 border-b border-line bg-ink-2 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ivory-dim sm:grid">
          <span />
          <span>Privat verkaufen</span>
          <span className="text-amber">Mit NoviDom</span>
        </div>
        {ROWS.map((r) => (
          <div key={r.topic} className="grid gap-2 border-b border-line px-6 py-5 last:border-b-0 sm:grid-cols-[180px_1fr_1fr] sm:gap-6">
            <div className="font-display text-lg text-ivory">{r.topic}</div>
            <div className="flex gap-2.5 text-sm leading-relaxed text-ivory-dim">
              <Minus className="mt-0.5 h-4 w-4 shrink-0 text-ivory-dim/60" strokeWidth={2} />
              <span>
                <span className="font-semibold sm:hidden">Privat: </span>
                {r.privat}
              </span>
            </div>
            <div className="flex gap-2.5 text-sm leading-relaxed text-ivory">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={2.25} />
              <span>
                <span className="font-semibold sm:hidden">NoviDom: </span>
                {r.novidom}
              </span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-20 font-display text-2xl text-ivory lg:text-3xl">Was Sie so nur bei uns bekommen</h3>
      <div className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {UNIQUE.map((u, i) => (
          <div key={u.title} className="border-t border-line pt-6">
            <span className="font-mono text-[11px] tracking-[0.2em] text-amber">{String(i + 1).padStart(2, "0")}</span>
            <h4 className="mt-3 font-display text-xl text-ivory">{u.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{u.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="#kontakt" className="rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink hover:bg-amber">
          Gratis-Bewertung anfragen
        </Link>
        <Link href="#kommission" className="rounded-full border border-line px-7 py-4 text-sm font-semibold text-ivory hover:border-ivory">
          Provision berechnen
        </Link>
      </div>
    </section>
  );
}
