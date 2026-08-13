import { Landmark, Scan, LayoutGrid, Gem, Handshake, ShieldOff } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const services = [
  { icon: Landmark, name: "IAZI-Bewertung", text: "Bankanerkannt" },
  { icon: Scan, name: "Matterport 3D", text: "Rundgang & Fotos" },
  { icon: LayoutGrid, name: "10+ Portale", text: "Maximale Reichweite" },
  { icon: Gem, name: "Käuferprüfung", text: "Finanzierbarkeit vorab" },
  { icon: Handshake, name: "Bis zum Notar", text: "Persönlich dabei" },
  { icon: ShieldOff, name: "Kein Risiko", text: "Kein Verkauf = keine Kosten" },
];

export function Services() {
  return (
    <section id="leistungen" className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Voller Service</SectionLabel>
        <h2 className="mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
          Alles inklusive.
        </h2>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.name} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-line bg-ink p-6 transition-colors hover:border-amber/40">
                <service.icon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                <div className="mt-4 font-display text-lg font-semibold text-ivory">
                  {service.name}
                </div>
                <div className="mt-1 text-sm text-ivory-dim">{service.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
