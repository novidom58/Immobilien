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
      </div>

      <Reveal delay={0.15}>
        <div className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {situations.map((situation) => (
            <div
              key={situation.name}
              className="w-[280px] shrink-0 snap-start rounded-2xl border-t-2 border-t-transparent bg-ink-2 p-9 transition-colors hover:border-t-amber"
            >
              <situation.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
              <div className="mt-5 font-display text-xl font-semibold text-ivory">
                {situation.name}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
                {situation.text}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
