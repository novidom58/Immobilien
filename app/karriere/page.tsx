import type { Metadata } from "next";
import { BadgeCheck, Briefcase, Camera, Crown, GraduationCap, Handshake, Landmark, Layers, MapPin, Radar, TrendingUp, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BewerbungForm } from "@/components/BewerbungForm";

export const metadata: Metadata = {
  title: "Karriere: Immobilienberater/in bei NoviDom",
  description:
    "Verkaufen Sie Immobilien und bauen Sie sich etwas auf: 35–50 % Anteil an der Provision, Bonus für eigene Mandate, Anteil an Hypotheken und ein Weg bis zur Beteiligung. Basel und Zug.",
  alternates: { canonical: "/karriere" },
};

// Öffentlicher Auszug aus «Karriere bei NoviDom» (ohne interne Folien).
// Prozente beziehen sich auf die Provision ohne MWST, Sätze für Selbständige.
const HIGHLIGHTS = [
  { value: "35–50 %", label: "Anteil an der Provision" },
  { value: "+5 %", label: "für selbst gewonnene Mandate" },
  { value: "30 %", label: "der Hypothekenprovision" },
  { value: "Aktien", label: "für die Besten" },
];

const OWNER_ARGUMENTS = [
  "Provision ab 0,95 % statt der üblichen 2–3 %",
  "CHF 0 Kosten, wenn nicht verkauft wird",
  "Gratis-Bewertung nach IAZI",
  "Käufer-Radar mit vorgemerkten Kaufinteressenten",
  "Fotos, Grundriss, 360°-Rundgang und Drohne mit Giraffe360",
  "Über 10 Portale und soziale Medien",
  "Käuferprüfung inklusive Finanzierbarkeit",
];

const BUILDING_BLOCKS = [
  { icon: TrendingUp, value: "35–50 %", title: "Leistungsstaffel", text: "Ihr Anteil steigt mit Ihrem Provisionsumsatz der letzten 12 Monate." },
  { icon: Handshake, value: "+5 %", title: "Bonus Eigenakquise", text: "Zusätzlich auf jeder Stufe für jedes selbst gewonnene Mandat." },
  { icon: Landmark, value: "30 %", title: "Hypothek", text: "Anteil an der Hypothekenprovision, wenn Ihre Käufer über HypoCasa finanzieren." },
  { icon: Users, value: "bis 20 %", title: "Teamleitung", text: "Auf jeden Verkauf Ihres Teams, zusätzlich zu Ihren eigenen Verkäufen." },
  { icon: Crown, value: "Aktien", title: "Beteiligung", text: "Die Besten werden Aktionärinnen und Aktionäre der NoviDom Immobilien AG." },
  { icon: Layers, value: "Flexibel", title: "Ihr Modell", text: "Angestellt oder selbständig, Vollzeit oder nebenberuflich." },
];

const CAREER = [
  { title: "Immobilienberater/in", rate: "35 %", when: "Einstieg mit Einarbeitung" },
  { title: "Senior-Berater/in", rate: "45 %", when: "ab CHF 40'000 Provisionsumsatz in 12 Monaten" },
  { title: "Top-Berater/in", rate: "50 %", when: "ab CHF 80'000 Provisionsumsatz in 12 Monaten" },
  { title: "Teamleiter/in", rate: "55 % + bis 20 % aufs Team", when: "ab Stufe 2, mit mindestens 2 Maklern im Team" },
  { title: "Beteiligung", rate: "Aktionär/in", when: "nach 2 Jahren als Top-Berater/in oder Teamleiter/in" },
];

const MODELS = [
  {
    kicker: "Sozial abgesichert",
    title: "Angestellt",
    items: ["Anstellung bei der NoviDom Immobilien AG", "Pensum nach Vereinbarung", "AHV, Pensionskasse und Unfallversicherung über NoviDom", "Staffel 30 / 40 / 45 %"],
  },
  {
    kicker: "Maximaler Anteil",
    title: "Selbständig",
    items: ["Volle Staffel 35 / 45 / 50 %", "Freie Zeiteinteilung, auch nebenberuflich", "Eigene AHV und Versicherungen", "Anerkennung durch die AHV-Ausgleichskasse nötig"],
  },
];

const SUPPORT = [
  { icon: Radar, title: "Käufer-Radar", text: "Vorgemerkte Interessenten für schnellere Verkäufe." },
  { icon: Camera, title: "Giraffe360", text: "Fotos, Grundriss, 360°-Rundgang und Drohne in einem Termin." },
  { icon: Briefcase, title: "Leads der Firma", text: "Bewertungsanfragen über Website und Werbung." },
  { icon: Landmark, title: "Finanzierung im Haus", text: "Hypothekenexperten im Team, Käufer schneller geprüft." },
  { icon: GraduationCap, title: "Einarbeitung", text: "Training, Gesprächsleitfäden und IAZI-Bewertungen." },
  { icon: MapPin, title: "Basel und Zug", text: "Zwei Standorte, flexibel im Pensum." },
];

const STEPS = [
  { title: "Kennenlernen", text: "Wir sprechen über Ihre Ziele und Ihr Pensum." },
  { title: "Mitlaufen", text: "Sie begleiten uns an eine Bewertung und eine Besichtigung." },
  { title: "Starten", text: "Vertrag, Einarbeitung und Ihre ersten Mandate." },
];

export default function KarrierePage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <section className="mx-auto max-w-5xl px-6 pb-14 pt-36 text-center lg:pt-44">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Karriere bei NoviDom · Basel &amp; Zug</div>
          <h1 className="mt-6 text-balance font-display text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1.05] tracking-[-0.03em] text-ivory">
            Immobilien verkaufen. <em>Etwas aufbauen.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ivory-dim">
            Unser Vergütungs- und Karrieremodell für Maklerinnen und Makler: fair am Erfolg beteiligt, mit einem klaren Weg bis zur Beteiligung an der Firma.
          </p>
          <a href="#bewerben" className="mt-8 inline-flex rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-amber">
            Gespräch vereinbaren
          </a>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="rounded-2xl border border-line bg-white p-4">
                <div className="font-display text-2xl text-amber lg:text-3xl">{h.value}</div>
                <div className="mt-1 text-xs text-ivory-dim">{h.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:px-10">
          <div>
            <SectionLabel>Warum Eigentümer zu uns kommen</SectionLabel>
            <h2 className="mt-6 font-display text-3xl text-ivory lg:text-4xl">
              Ein Angebot, das Sie <em>gerne zeigen.</em>
            </h2>
            <p className="mt-4 leading-relaxed text-ivory-dim">Für Sie heisst das: Mandate lassen sich leichter gewinnen.</p>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {OWNER_ARGUMENTS.map((a) => (
              <li key={a} className="flex gap-2.5 rounded-xl border border-line bg-white p-3.5 text-sm text-ivory">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={1.75} />
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-ink-2 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <SectionLabel>Das Modell</SectionLabel>
            <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
              Sechs Bausteine <em>für Ihren Verdienst.</em>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BUILDING_BLOCKS.map((b) => (
                <div key={b.title} className="rounded-2xl border border-line bg-white p-6">
                  <div className="flex items-center justify-between">
                    <b.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                    <span className="font-display text-2xl text-amber">{b.value}</span>
                  </div>
                  <div className="mt-4 font-display text-xl text-ivory">{b.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-ivory-dim">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
          <SectionLabel>Karriere</SectionLabel>
          <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
            Ihr Weg vom Einstieg <em>bis zur Beteiligung.</em>
          </h2>
          <ol className="grid gap-3">
            {CAREER.map((c, i) => (
              <li key={c.title} className="grid items-center gap-2 rounded-2xl border border-line bg-white p-5 sm:grid-cols-[48px_1fr_auto] sm:gap-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber font-display text-lg text-white">{i + 1}</span>
                <div>
                  <div className="font-display text-xl text-ivory">{c.title}</div>
                  <div className="text-sm text-ivory-dim">{c.when}</div>
                </div>
                <div className="font-display text-lg text-amber sm:text-right">{c.rate}</div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ivory-dim">Auf jeder Stufe zusätzlich: Bonus Eigenakquise und Anteil an der Hypothekenprovision.</p>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
          <SectionLabel>Zusammenarbeit</SectionLabel>
          <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
            Angestellt oder selbständig: <em>Sie wählen.</em>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {MODELS.map((m) => (
              <div key={m.title} className="rounded-2xl border border-line bg-white p-6 lg:p-8">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber">{m.kicker}</div>
                <div className="mt-2 font-display text-2xl text-ivory">{m.title}</div>
                <ul className="mt-4 grid gap-2">
                  {m.items.map((it) => (
                    <li key={it} className="flex gap-2.5 text-sm text-ivory-dim">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={1.75} />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ivory-dim">Vertragsdetails werden individuell vereinbart.</p>
        </section>

        <section className="bg-ink-2 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <SectionLabel>Unterstützung</SectionLabel>
            <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
              Sie verkaufen, <em>wir machen den Rest.</em>
            </h2>
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {SUPPORT.map((s) => (
                <div key={s.title} className="border-t border-line pt-5">
                  <s.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                  <div className="mt-3 font-display text-xl text-ivory">{s.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-ivory-dim">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pt-20 lg:px-10">
          <SectionLabel>Nächste Schritte</SectionLabel>
          <h2 className="mb-8 mt-6 font-display text-3xl text-ivory lg:text-4xl">
            In drei Schritten <em>zu NoviDom.</em>
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-line bg-white p-6">
                <span className="font-display text-3xl text-amber">{i + 1}</span>
                <div className="mt-2 font-display text-xl text-ivory">{s.title}</div>
                <p className="mt-1 text-sm text-ivory-dim">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="bewerben" className="mx-auto max-w-4xl scroll-mt-28 px-4 py-20 lg:px-10">
          <h2 className="mb-8 px-2 font-display text-3xl text-ivory lg:text-4xl">
            Gespräch <em>vereinbaren.</em>
          </h2>
          <BewerbungForm />
          <p className="mt-6 px-2 text-xs leading-relaxed text-ivory-dim">
            Alle Prozente beziehen sich auf die bezahlte Provision ohne MWST. Die Staffel 35 / 45 / 50 % gilt für Selbständige, für Angestellte je 5 Punkte tiefer. Vertragsdetails werden individuell vereinbart.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
