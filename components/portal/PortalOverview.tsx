import { BellRing, Calculator, Hammer, Home, LineChart, Map, Route, Search, ShieldCheck, Tag, type LucideIcon } from "lucide-react";

export type OverviewTile = { key: string; label: string; status: string; href: string; highlight?: boolean };

const ICONS: Record<string, LucideIcon> = {
  verkauf: LineChart,
  weg: Route,
  suchprofil: Search,
  objekte: BellRing,
  finanzierung: Calculator,
  versicherung: ShieldCheck,
  umbau: Hammer,
  eigentum: Home,
  verkaufen: Tag,
};

/**
 * Übersicht oben im Portal: jeder Bereich als Kachel mit dem aktuellen Stand.
 * Ein Klick springt hin und klappt eingeklappte Bereiche auf.
 */
export function PortalOverview({ tiles }: { tiles: OverviewTile[] }) {
  return (
    <nav aria-label="Übersicht" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((t) => {
        const Icon = ICONS[t.key] ?? Map;
        return (
          <a
            key={t.key}
            href={t.href}
            className={`group flex flex-col rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-amber ${
              t.highlight ? "border-line bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.25)]" : "border-dashed border-line bg-ink-2/60"
            }`}
          >
            <span className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-amber" strokeWidth={1.6} />
              <span aria-hidden className="text-ivory-dim transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
            <span className="mt-3 font-display text-lg leading-tight text-ivory">{t.label}</span>
            <span className="mt-1 text-xs leading-snug text-ivory-dim">{t.status}</span>
          </a>
        );
      })}
    </nav>
  );
}
