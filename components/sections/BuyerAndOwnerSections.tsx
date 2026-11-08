import Link from "next/link";
import { BadgeCheck, BellRing, Lock, Sofa } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RentVsBuy } from "@/components/sections/RentVsBuy";
import { WertmonitorForm } from "@/components/sections/WertmonitorForm";

const BUYER = [
  { icon: Lock, title: "Off-Market zuerst", text: "Neue Objekte sehen Sie 48 Stunden vor allen anderen, wenn Ihr Suchprofil passt." },
  { icon: BadgeCheck, title: "Finanzierungs-Pass", text: "Ihre Kaufkraft vorab geprüft. Verkäufer laden geprüfte Käufer bevorzugt ein." },
  { icon: Sofa, title: "Selbst einrichten", text: "Möbel im Grundriss verschieben, bevor Sie überhaupt besichtigen." },
  { icon: BellRing, title: "Käufer-Alarm", text: "Passt ein neues Objekt, erfahren Sie es sofort per Mail." },
];

/** Mieten oder kaufen? plus die Vorteile für Käufer. */
export function BuyerSection() {
  return (
    <section id="mieten-kaufen" className="scroll-mt-24 bg-ink-2 py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-10">
        <div className="px-2">
          <SectionLabel>Für Käufer</SectionLabel>
          <h2 className="mt-6 max-w-3xl text-balance font-display text-3xl text-ivory lg:text-5xl">
            Mieten oder kaufen? <em>Was es wirklich kostet.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivory-dim">
            Monatliche Kosten heute und Ihr Vermögen in 10 Jahren, ehrlich gerechnet. Schieben Sie die Regler auf Ihre Situation.
          </p>
        </div>
        <div className="mt-10">
          <RentVsBuy />
        </div>

        <div className="mt-16 grid gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
          {BUYER.map((b) => (
            <div key={b.title} className="rounded-2xl border border-line bg-white p-6">
              <b.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
              <div className="mt-4 font-display text-xl text-ivory">{b.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{b.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 px-2">
          <Link href="/login?redirect=/dashboard" className="inline-flex rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink hover:bg-amber">
            Kostenloses Kundenkonto eröffnen
          </Link>
        </div>
      </div>
    </section>
  );
}

const OWNER_POINTS = [
  "Jedes Quartal der aktuelle Richtwert per Mail",
  "Gleiche Angaben wie bei der kostenlosen Bewertung",
  "Hypothekenwächter: rechtzeitig vor dem Ablauf vergleichen",
  "Kostenlos, Abmeldung jederzeit",
];

/** Wertmonitor für Eigentümer, die (noch) nicht verkaufen. Gleicher Funnel wie die Bewertung. */
export function OwnerSection() {
  return (
    <section id="wertmonitor" className="scroll-mt-24 bg-ink-2 py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div>
          <SectionLabel>Wertmonitor</SectionLabel>
          <h2 className="mt-6 text-balance font-display text-3xl text-ivory lg:text-5xl">
            Was ist Ihr Zuhause <em>heute wert?</em>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-ivory-dim">
            Kein Verkauf geplant? Trotzdem gut zu wissen. Sie erhalten jedes Quartal kostenlos den aktuellen Richtwert per Mail. Und wenn Ihre
            Hypothek ausläuft, erinnern wir Sie rechtzeitig.
          </p>
          <ul className="mt-8 grid gap-3">
            {OWNER_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-ivory-dim">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber/70" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:mt-11">
          <WertmonitorForm />
        </div>
      </div>
    </section>
  );
}
