import { Marquee } from "@/components/ui/Marquee";

const items = [
  "IAZI-Bewertung",
  "Matterport-3D-Rundgang",
  "0.95% Provision",
  "10+ Immobilienportale",
  "Käuferprüfung inklusive",
  "Kein Verkauf = keine Kosten",
  "18+ Jahre Bankerfahrung",
  "Basel & Nordwestschweiz",
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
