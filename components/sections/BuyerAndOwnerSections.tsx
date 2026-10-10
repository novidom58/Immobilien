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

/** Wertmonitor für Eigentümer, die (noch) nicht verkaufen. */
export function OwnerSection() {
  return (
    <section id="wertmonitor" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-28 lg:px-10">
      <div className="rounded-[28px] border border-line bg-white p-6 shadow-[0_15px_70px_rgba(61,53,34,0.06)] lg:p-11">
        <SectionLabel>Wertmonitor</SectionLabel>
        <h2 className="mt-6 text-balance font-display text-3xl text-ivory lg:text-4xl">
          Was ist Ihr Zuhause <em>heute wert?</em>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-ivory-dim">
          Kein Verkauf geplant? Trotzdem gut zu wissen. Sie erhalten jedes Quartal kostenlos den aktuellen Richtwert per Mail. Und wenn Ihre
          Hypothek ausläuft, erinnern wir Sie rechtzeitig.
        </p>
        <div className="mt-8">
          <WertmonitorForm />
        </div>
      </div>
    </section>
  );
}
