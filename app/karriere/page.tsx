import type { Metadata } from "next";
import { Handshake, LineChart, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BewerbungForm } from "@/components/BewerbungForm";

export const metadata: Metadata = {
  title: "Karriere: Teil vom NoviDom-Team werden",
  description:
    "Immobilien, Finanzierung, Umbau und Versicherung aus einer Hand: Werden Sie Teil der NoviDom Immobilien AG in Basel, Zug und Zürich. Jetzt bewerben.",
  alternates: { canonical: "/karriere" },
};

const REASONS = [
  { icon: Handshake, title: "Ein Team, alles aus einer Hand", text: "Verkauf, Finanzierung, Umbau und Versicherung arbeiten zusammen. Sie verkaufen nicht allein, Sie haben Fachleute an Ihrer Seite." },
  { icon: Sparkles, title: "Moderne Werkzeuge", text: "Eigenes CRM, Kundenportal, 3D-Rundgänge, Drohnenaufnahmen und KI-Visualisierungen. Weniger Papier, mehr Zeit für Kunden." },
  { icon: LineChart, title: "Fair beteiligt", text: "Wer Abschlüsse bringt, verdient mit. Wir besprechen das Modell offen im ersten Gespräch." },
  { icon: MapPin, title: "Basel, Zug und Zürich", text: "Kurze Wege in der Region, Büros in Basel und Zug, flexible Einteilung." },
];

const PROFILES = [
  { title: "Immobilienmakler/in", text: "Sie bewerten, vermarkten und verkaufen, mit Freude am Kontakt und Abschluss. Erfahrung oder Fachausweis ist ein Plus." },
  { title: "Finanzierung & Versicherung", text: "Hypotheken, Vorsorge und Versicherungen rund ums Eigenheim. Bank- oder Versicherungshintergrund willkommen." },
  { title: "Quereinstieg & Einstieg", text: "Kaufmännisch, Bau oder Verkauf und Lust auf Immobilien? Wir bilden Sie im Team weiter." },
  { title: "Tippgeber & Partner", text: "Sie kennen Eigentümer, die verkaufen möchten? Empfehlen Sie uns weiter, bei einem Abschluss erhalten Sie eine Tippgeber-Provision." },
];

export default function KarrierePage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-36 text-center lg:pt-44">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Karriere bei NoviDom</div>
          <h1 className="mt-6 text-balance font-display text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1.05] tracking-[-0.03em] text-ivory">
            Werden Sie Teil <em>vom Team.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ivory-dim">
            Wir begleiten Menschen beim wichtigsten Kauf ihres Lebens, vom Verkauf über die Hypothek bis zum Umbau. Dafür suchen wir Persönlichkeiten, die genauso denken.
          </p>
          <a href="#bewerben" className="mt-8 inline-flex rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-amber">
            Jetzt bewerben
          </a>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((r) => (
              <div key={r.title} className="border-t border-line pt-6">
                <r.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                <h2 className="mt-4 font-display text-xl text-ivory">{r.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-ink-2 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <SectionLabel>Wen wir suchen</SectionLabel>
            <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
              Profile, die <em>zu uns passen.</em>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {PROFILES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-line bg-white p-6">
                  <div className="font-display text-xl text-ivory">{p.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{p.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-ivory-dim">Keine passende Rolle dabei? Bewerben Sie sich initiativ, wir lernen gerne gute Leute kennen.</p>
          </div>
        </section>

        <section id="bewerben" className="mx-auto max-w-4xl scroll-mt-28 px-4 py-24 lg:px-10">
          <h2 className="mb-8 px-2 font-display text-3xl text-ivory lg:text-4xl">
            Ihre <em>Bewerbung.</em>
          </h2>
          <BewerbungForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
