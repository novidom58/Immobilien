import { SectionLabel } from "@/components/ui/SectionLabel";
import { Counter } from "@/components/ui/Counter";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/lib/reveal";

const stats = [
  { to: 0.95, decimals: 2, suffix: "%", label: "Provision statt 3%" },
  { to: 500, suffix: "+", label: "Immobilienbewertungen" },
  { to: 18, suffix: "+", label: "Jahre Bankerfahrung" },
  { to: 10, suffix: "+", label: "Immobilienportale" },
];

const area = [
  "Basel-Stadt",
  "Riehen",
  "Bettingen",
  "Binningen",
  "Allschwil",
  "Reinach",
  "Muttenz",
  "Arlesheim",
  "Pratteln",
  "Liestal",
];

export function StatsAndArea() {
  return (
    <section className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Erfolge</SectionLabel>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.1}>
              <Counter
                to={stat.to}
                decimals={"decimals" in stat ? stat.decimals : 0}
                suffix={stat.suffix}
                className="font-display text-5xl font-semibold text-amber lg:text-6xl"
              />
              <p className="mt-3 max-w-xs text-balance text-sm text-ivory-dim">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.3em] text-ivory-dim/60">
          Aktiv in der gesamten Region Basel
        </p>
        <Marquee
          items={area.map((place) => (
            <span
              key={place}
              className="font-display text-2xl font-medium text-ivory-dim/40 lg:text-3xl"
            >
              {place}
            </span>
          ))}
        />
      </div>
    </section>
  );
}
