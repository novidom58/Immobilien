import { BellRing, Check, Clock, Home, Landmark, Scale, Users } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AreaInteractive } from "./AreaParts";

// Inhalte nach dem Aufbau von hypocasa.ch, unserem Finanzierungspartner.
// Zahlen und Fallbeispiele sind Angaben von HypoCasa.

const USPS = [
  {
    big: "24h",
    title: "Finanzierungsbestätigung innert 24 Stunden",
    text: "Nach dem Erstgespräch und mit den nötigen Unterlagen haben Sie innert eines Werktages eine Bestätigung. So können Sie sofort handeln, wenn die richtige Immobilie auftaucht.",
  },
  {
    big: "50+",
    title: "Banken, Versicherungen und Pensionskassen im Vergleich",
    text: "Statt nur bei der Hausbank anzufragen, treten über 50 Anbieter für Sie gegeneinander an. Das senkt die Kosten.",
  },
  {
    big: "100%",
    title: "Wir übernehmen den ganzen Prozess",
    text: "Dossier, Anbietervergleich, PK-Bezug, Säule 3a und Notartermin: Sie müssen sich um nichts kümmern.",
  },
  {
    big: "Ø 25k",
    title: "CHF 25'000 durchschnittliche Ersparnis",
    text: "Durch gezieltes Verhandeln und die Wahl des richtigen Anbieters, über die gesamte Laufzeit gerechnet (Angabe HypoCasa).",
  },
];

const CHECKS = [
  { title: "Einkommen & Tragbarkeit", text: "Gerechnet mit den banküblichen Vorgaben, realistisch statt geschönt." },
  { title: "Eigenkapital & Belehnung", text: "Wie viel Eigenmittel nötig sind und was sich über die Pensionskasse abdecken lässt." },
  { title: "PK-Vorbezug & 3. Säule", text: "Wie Sie Vorsorgegelder optimal und steuerschonend einsetzen." },
  { title: "Kaufpreis & Schätzwert", text: "Wir gleichen Ihren Wunschpreis mit dem ab, was Banken tatsächlich finanzieren." },
];

const STEPS = [
  { title: "Erstgespräch & Analyse", text: "Einkommen, Eigenkapital, Lebensplan. Persönlich, ohne Formularberg." },
  { title: "Strategie & Vergleich", text: "Finanzierungsstrategie, Offerten bei über 50 Anbietern, PK- und 3a-Koordination." },
  { title: "Bestätigung innert 24h", text: "Verbindliche Finanzierungsbestätigung, damit Sie sofort handeln können." },
  { title: "Abschluss & Notar", text: "Begleitung durch Vertragsphase und Notartermin bis zur Schlüsselübergabe." },
  { title: "Langfristige Begleitung", text: "Verlängerung, SARON Alarm, Zinsstrategie: Wir bleiben Ihr Ansprechpartner." },
];

const GUARANTEE = [
  "Vollständig unabhängige Beratung",
  "Mindestens 3 Offerten im Vergleich",
  "Finanzierungsbestätigung innert 24h",
  "PK- und 3a-Koordination inklusive",
  "Begleitung bis zum Notartermin",
  "SARON Alarm inklusive",
  "Kostenlos für Sie",
];

const SITUATIONS = [
  { title: "Erstkäufer", text: "Schritt für Schritt erklärt, ohne Bankenjargon." },
  { title: "Selbstständige & KMU", text: "Wir wissen, wie Banken unregelmässige Einkommen beurteilen, und bereiten Ihr Dossier optimal auf." },
  { title: "Familien", text: "Langfristige Planung mit Absicherung, falls ein Einkommen wegfällt." },
  { title: "Renditeliegenschaften", text: "Steueroptimierte Finanzierungsstruktur für Anlageobjekte." },
  { title: "Verlängerung & Umschuldung", text: "Hypothek läuft aus? Wir prüfen, ob sich ein Wechsel lohnt." },
  { title: "Paare & Konkubinate", text: "Eigentumsstruktur, Absicherung und Aufteilung sauber aufgesetzt." },
];

const CASES = [
  {
    name: "Familie B.",
    meta: "Erstkäufer · Deutschschweiz",
    big: "CHF 22'000",
    bigLabel: "Ersparnis über 10 Jahre",
    steps: [
      "Angebot der Hausbank, aber kein Marktüberblick.",
      "Vergleich von 12 Anbietern, Verhandlung, 3a-Optimierung für indirekte Amortisation.",
      "0.42% tieferer Zins plus Steuerersparnis von CHF 2'400 pro Jahr.",
    ],
  },
  {
    name: "Herr S.",
    meta: "Selbstständig · Aarau",
    big: "48h",
    bigLabel: "bis zur Finanzierungsbestätigung",
    steps: [
      "Zwei Banken lehnten ab, das Traumobjekt drohte verloren zu gehen.",
      "Dossier mit den richtigen Kennzahlen aufbereitet, gezielt an spezialisierte Partner.",
      "Bestätigung innert 48 Stunden, Objekt reserviert.",
    ],
  },
];

const card = "rounded-[24px] border border-line bg-white p-6 shadow-[0_15px_70px_rgba(61,53,34,0.06)] lg:p-8";

export function FinanzierenContent() {
  return (
    <>
      {/* Was uns unterscheidet */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionLabel>Was uns unterscheidet</SectionLabel>
        <h2 className="mt-6 max-w-3xl font-display text-3xl text-ivory lg:text-5xl">
          Aus der Bankenwelt. <em>Ganz auf Ihrer Seite.</em>
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-ivory-dim">
          Unser Finanzierungspartner HypoCasa kennt die Banksysteme von innen und stellt sich vollständig auf Ihre Seite.
          Das Resultat: bessere Konditionen, weniger Aufwand, mehr Sicherheit.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {USPS.map((u) => (
            <div key={u.title} className={card}>
              <div className="font-display text-4xl text-amber">{u.big}</div>
              <h3 className="mt-4 font-display text-lg text-ivory">{u.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{u.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rechner + individuelle Prüfung */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-24 lg:grid-cols-[1.3fr_1fr] lg:px-10">
        <AreaInteractive id="fin" title="Erste Orientierung" />
        <div className={card}>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Individuelle Prüfung</div>
          <h3 className="mt-3 font-display text-2xl text-ivory">Wie viel Eigenheim ist möglich?</h3>
          <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
            Statt eines anonymen Online-Rechners machen wir eine echte Tragbarkeitsprüfung, abgestimmt auf Ihre Situation.
          </p>
          <ul className="mt-6 space-y-4">
            {CHECKS.map((c) => (
              <li key={c.title} className="flex gap-3">
                <Check className="mt-1 h-4 w-4 shrink-0 text-amber" strokeWidth={2} />
                <span>
                  <span className="font-semibold text-ivory">{c.title}</span>
                  <span className="block text-sm text-ivory-dim">{c.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <a href="#kontakt" className="mt-8 inline-flex rounded-full bg-amber px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
            Persönliche Prüfung anfragen
          </a>
        </div>
      </section>

      {/* Dienste */}
      <section className="bg-ink-2 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionLabel>Unsere Dienstleistungen</SectionLabel>
          <h2 className="mt-6 max-w-3xl font-display text-3xl text-ivory lg:text-5xl">
            Mehr als nur <em>Hypothekenvermittlung.</em>
          </h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            <div className={`${card} lg:col-span-2`}>
              <div className="flex items-center gap-3">
                <BellRing className="h-6 w-6 text-amber" strokeWidth={1.5} />
                <span className="rounded-full bg-amber/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber">
                  Exklusiv mit HypoCasa
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl text-ivory">SARON Alarm, Ihr persönlicher Zins-Wächter</h3>
              <p className="mt-3 max-w-2xl text-ivory-dim">
                Der SARON ändert sich laufend. Viele verpassen den richtigen Moment für den Wechsel zur Festhypothek und
                zahlen unnötig viel. Der SARON Alarm meldet sich proaktiv, wenn eine Anpassung sinnvoll ist. Kostenlos für
                alle Kundinnen und Kunden.
              </p>
            </div>
            <div className={card}>
              <Scale className="h-6 w-6 text-amber" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-xl text-ivory">Unabhängiger Vergleich</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">
                Angebote von über 50 Anbietern, verhandelt für Sie. Unabhängig, persönlich und kostenlos.
              </p>
            </div>
            <div className={card}>
              <Home className="h-6 w-6 text-amber" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-xl text-ivory">Immobilie gleich mit dabei</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">
                Suche, Bewertung und Kauf über NoviDom, die Finanzierung parallel geklärt. Kein Zeitverlust.
              </p>
            </div>
            <div className={card}>
              <Landmark className="h-6 w-6 text-amber" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-xl text-ivory">Keine Zinstabellen, mit Absicht</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">
                Ihr Zins hängt von Bonität, Belehnung und Laufzeit ab. Pauschale «ab»-Sätze führen oft in die Irre. Wir
                verhandeln Ihren persönlichen Satz.
              </p>
            </div>
            <div className={card}>
              <Users className="h-6 w-6 text-amber" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-xl text-ivory">Bei Ihnen zuhause</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory-dim">
                Wir kommen zu Ihnen, wann und wo es passt. Kein Weg ins Büro nötig.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ablauf + Garantie */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.4fr_1fr] lg:px-10">
        <div>
          <SectionLabel>So funktioniert es</SectionLabel>
          <h2 className="mt-6 font-display text-3xl text-ivory lg:text-5xl">
            Von der Anfrage <em>bis zum Schlüssel.</em>
          </h2>
          <ol className="mt-10 space-y-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber font-display text-amber">
                  {i + 1}
                </span>
                <span>
                  <span className="font-display text-xl text-ivory">{s.title}</span>
                  <span className="mt-1 block text-ivory-dim">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className={`${card} h-fit`}>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-ivory">Unsere Garantie</h3>
          </div>
          <ul className="mt-6 space-y-3">
            {GUARANTEE.map((g) => (
              <li key={g} className="flex items-center gap-3 text-ivory">
                <Check className="h-4 w-4 shrink-0 text-amber" strokeWidth={2} />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Situationen */}
      <section className="bg-ink-2 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionLabel>Für wen wir da sind</SectionLabel>
          <h2 className="mt-6 font-display text-3xl text-ivory lg:text-5xl">
            Jede Situation ist <em>anders.</em>
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SITUATIONS.map((s) => (
              <div key={s.title} className={card}>
                <h3 className="font-display text-xl text-ivory">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fallbeispiele */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionLabel>Fallbeispiele</SectionLabel>
        <h2 className="mt-6 font-display text-3xl text-ivory lg:text-5xl">
          Echte Situationen. <em>Echte Lösungen.</em>
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {CASES.map((c) => (
            <div key={c.name} className={card}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="font-display text-2xl text-ivory">{c.name}</div>
                  <div className="text-sm text-ivory-dim">{c.meta}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-3xl text-amber">{c.big}</div>
                  <div className="text-xs text-ivory-dim">{c.bigLabel}</div>
                </div>
              </div>
              <ol className="mt-6 space-y-3 border-t border-line pt-5">
                {["Ausgangslage", "Lösung", "Ergebnis"].map((label, i) => (
                  <li key={label} className="grid grid-cols-[110px_1fr] gap-3 text-sm">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber">{label}</span>
                    <span className="text-ivory-dim">{c.steps[i]}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ivory-dim/70">Fallbeispiele von HypoCasa, Namen gekürzt.</p>
      </section>
    </>
  );
}
