import { Home, HeartCrack, Scroll, RefreshCw, Sunset, Zap } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const situations = [
  {
    icon: Home,
    name: "Allgemeiner Verkauf",
    text: "Professionell und zum besten Preis verkaufen — ohne Stress der Selbstvermarktung.",
  },
  {
    icon: HeartCrack,
    name: "Scheidung / Trennung",
    text: "Neutral und diskret. Faire Bewertung, klare Kommunikation — auch in emotionalen Situationen.",
  },
  {
    icon: Scroll,
    name: "Erbschaft",
    text: "Sie haben geerbt und sind unsicher? Wir beraten ehrlich und zeigen alle Optionen.",
  },
  {
    icon: RefreshCw,
    name: "Hauswechsel",
    text: "Verkauf und Neukauf koordiniert. Dank Hypothekenexpertise planen wir beides zusammen.",
  },
  {
    icon: Sunset,
    name: "Verkleinerung im Alter",
    text: "Wir begleiten Sie sensibel in eine passendere Wohnsituation — auf Ihrem Tempo.",
  },
  {
    icon: Zap,
    name: "Privatverkauf läuft nicht",
    text: "Zu wenig Anfragen? Wir übernehmen, optimieren und bringen den Verkauf zum Abschluss.",
  },
];

export function Situations() {
  return (
    <section className="relative overflow-hidden bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Für wen wir da sind</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          In diesen Situationen <span className="text-amber-soft">helfen wir</span>.
        </h2>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {situations.map((situation, i) => (
            <Reveal key={situation.name} delay={i * 0.05}>
              <div className="group h-full rounded-2xl border border-line bg-ink-2 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40 hover:shadow-[0_20px_50px_-25px_rgba(232,168,85,0.4)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber/10 transition-colors duration-300 group-hover:bg-amber/15">
                  <situation.icon className="h-5 w-5 text-amber" strokeWidth={1.5} />
                </div>
                <div className="mt-6 font-display text-xl font-semibold text-ivory">
                  {situation.name}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
                  {situation.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
