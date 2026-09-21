import { Marquee } from "@/components/ui/Marquee";

const items = [
  "IAZI-Bewertung",
  "Virtuelle 360°-Besichtigung",
  "Ab 0.95% Provision",
  "10+ Immobilienportale",
  "Käuferprüfung inklusive",
  "Kein Verkauf = keine Kosten",
  "20+ Jahre Bankerfahrung",
  "Nordwestschweiz bis Vierwaldstättersee",
];

export function UspMarquee() {
  return (
    <div className="relative overflow-hidden bg-amber py-4">
      <Marquee
        items={items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-8 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-ink"
          >
            {item}
            <span aria-hidden className="text-ink/40">
              ·
            </span>
          </span>
        ))}
      />
    </div>
  );
}
