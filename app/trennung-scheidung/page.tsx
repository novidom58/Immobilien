import type { Metadata } from "next";
import Link from "next/link";
import { EyeOff, Scale, Landmark, KeyRound } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FinalCta } from "@/components/sections/FinalCta";
import { BuyoutCalculator } from "@/components/sections/BuyoutCalculator";
import { AreaFaq } from "@/components/leistungen/AreaParts";

export const metadata: Metadata = {
  title: "Trennung & Scheidung mit Haus — NoviDom",
  description:
    "Neutrale Bewertung, Auskauf-Rechner und Finanzierung für die Übernahme oder ein diskreter Verkauf. Ein Ansprechpartner für das gemeinsame Haus bei Trennung und Scheidung.",
  alternates: { canonical: "/trennung-scheidung" },
};

const STEPS = [
  { title: "Vertrauliches Erstgespräch", text: "Allein oder zu zweit, wie es für Sie passt. Wir hören zu und erklären die möglichen Wege." },
  { title: "Neutrale Bewertung", text: "Ein bankanerkannter Marktwert, den beide Seiten sehen. Eine Zahl statt zwei Meinungen." },
  { title: "Wege vergleichen", text: "Eine Person übernimmt, gemeinsam verkaufen oder vorerst vermieten. Mit Zahlen für jeden Weg." },
  { title: "Finanzierung klären", text: "Kann die übernehmende Person allein finanzieren? HypoCasa prüft verbindlich innert 24 Stunden." },
  { title: "Umsetzen", text: "Übertragung beim Notar und neue Hypothek, oder ein diskreter Verkauf. Wir koordinieren alles." },
];

const PROMISES = [
  { icon: EyeOff, title: "Diskret", text: "Kein Schild vor dem Haus, auf Wunsch Off-Market nur an geprüfte Käufer. Getrennte Termine sind möglich." },
  { icon: Scale, title: "Neutral", text: "Wir arbeiten für eine faire Lösung, nicht für eine Seite. Beide erhalten dieselben Unterlagen." },
  { icon: Landmark, title: "Finanzkompetent", text: "Auskauf, neue Hypothek, Solidarhaftung und Pensionskasse: Wir rechnen es mit HypoCasa durch." },
  { icon: KeyRound, title: "Ein Ansprechpartner", text: "Statt Bank, Makler, Notar und Treuhänder einzeln: Wir führen, Ihre Anwälte entscheiden mit." },
];

const FAQ = [
  {
    q: "Wer haftet für die Hypothek nach der Trennung?",
    a: "Haben Sie die Hypothek gemeinsam abgeschlossen, haften meist beide solidarisch, auch nach dem Auszug. Übernimmt eine Person das Haus, muss die Bank die andere aus der Haftung entlassen. Das planen wir von Anfang an mit.",
  },
  {
    q: "Was passiert mit Pensionskassen-Vorbezügen?",
    a: "Wurde Geld aus der Pensionskasse für das Haus bezogen, muss es beim Verkauf in der Regel zurückbezahlt werden. Bei einer Übernahme wird es bei der Aufteilung berücksichtigt. Ihr Anwalt klärt die genaue Rechnung.",
  },
  {
    q: "Fallen beim Übertragen auf eine Person Steuern an?",
    a: "Die Grundstückgewinnsteuer wird bei einer Übertragung unter Ehegatten im Zusammenhang mit der Scheidung oft aufgeschoben. Das hängt vom Kanton und vom Fall ab. Ein Treuhänder aus unserem Netzwerk prüft es.",
  },
  {
    q: "Müssen wir das Haus schnell verkaufen?",
    a: "Nein. Unter Zeitdruck verkauft man meist zu billig. Oft ist eine Übergangslösung besser, etwa vorerst vermieten, bis die Kinder die Schule abgeschlossen haben.",
  },
  {
    q: "Machen Sie auch die rechtliche Beratung?",
    a: "Nein. Güterrecht, Unterhalt und die Scheidung selbst gehören zu Anwälten und Notaren. Wir arbeiten mit ihnen zusammen und liefern Bewertung, Finanzierung, Verkauf und Koordination.",
  },
];

export default function TrennungPage() {
  return (
    <>
      <Header />
      <main className="bg-ink">
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-36 text-center lg:pt-44">
          <div className="inline-flex items-center gap-2 rounded-full bg-ink-3 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim">
            Lebenssituation · Trennung &amp; Scheidung
          </div>
          <h1 className="mt-7 text-balance font-display text-[clamp(2.4rem,5.5vw,4.8rem)] font-normal leading-[1.05] tracking-[-0.03em] text-ivory">
            Trennung mit Haus.
            <br />
            <em>Fair und ruhig geregelt.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-relaxed text-ivory-dim">
            Was ist das Haus wert? Kann eine Person es behalten? Oder verkaufen wir? Wir geben Ihnen eine neutrale Zahl, rechnen jeden Weg durch und
            setzen die Lösung diskret um.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#kontakt" className="rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-amber">
              Vertrauliches Gespräch
            </a>
            <a href="#rechner" className="rounded-full border border-line bg-ink px-7 py-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory">
              Auskauf berechnen
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-line bg-white p-6">
                <p.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                <div className="mt-4 font-display text-xl text-ivory">{p.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-ivory-dim">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="rechner" className="scroll-mt-24 bg-ink-2 py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-10">
            <div className="px-2">
              <SectionLabel>Auskauf-Rechner</SectionLabel>
              <h2 className="mt-6 max-w-3xl text-balance font-display text-3xl text-ivory lg:text-5xl">
                Können Sie das Haus <em>allein übernehmen?</em>
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ivory-dim">
                Auszahlung an den Partner, neue Hypothek und Tragbarkeit in einem Schritt. Anonym, nichts wird gespeichert.
              </p>
            </div>
            <div className="mt-10">
              <BuyoutCalculator />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
          <SectionLabel>So gehen wir vor</SectionLabel>
          <h2 className="mb-10 mt-6 font-display text-3xl text-ivory lg:text-4xl">
            In fünf Schritten <em>zu einer Lösung.</em>
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
          <p className="mt-10 rounded-2xl bg-ink-2 p-5 text-sm leading-relaxed text-ivory-dim">
            Wir ersetzen keine Rechtsberatung. Güterrecht, Unterhalt und die Scheidungsvereinbarung gehören zu Ihren Anwälten oder in die
            Mediation. Wir arbeiten eng mit ihnen zusammen und liefern, was sie brauchen: Bewertung, Finanzierungsnachweis und den Verkauf.{" "}
            <Link href="/leistungen/finanzieren" className="text-amber underline underline-offset-4">
              Mehr zur Finanzierung
            </Link>
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 lg:px-10">
          <SectionLabel>Häufige Fragen</SectionLabel>
          <h2 className="mb-8 mt-6 font-display text-3xl text-ivory lg:text-4xl">Gut zu wissen.</h2>
          <AreaFaq items={FAQ} />
        </section>

        <FinalCta topic="Trennung & Scheidung" />
      </main>
      <Footer />
    </>
  );
}
