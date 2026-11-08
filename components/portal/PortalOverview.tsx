"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Calculator, Check, Hammer, Home, LineChart, Map, Plus, Route, Search, ShieldCheck, Sofa, Tag, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type OverviewTile = {
  key: string;
  label: string;
  status: string;
  href: string;
  highlight?: boolean;
  /** Gehört zum gewählten Anliegen und steht immer oben */
  base?: boolean;
  pinned?: boolean;
};

const ICONS: Record<string, LucideIcon> = {
  verkauf: LineChart,
  weg: Route,
  suchprofil: Search,
  objekte: BellRing,
  planer: Sofa,
  finanzierung: Calculator,
  versicherung: ShieldCheck,
  umbau: Hammer,
  eigentum: Home,
  verkaufen: Tag,
};

/**
 * Übersicht oben im Portal: jeder Bereich als Kachel mit dem aktuellen Stand.
 * Ein Klick springt hin. Mit «+» wird ein Bereich angeheftet und steht dann
 * immer offen oben (im Konto gespeichert, auf allen Geräten).
 */
export function PortalOverview({ tiles, pins }: { tiles: OverviewTile[]; pins: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  function togglePin(key: string, pinned: boolean) {
    const supabase = createClient();
    if (!supabase) return;
    const next = pinned ? pins.filter((k) => k !== key) : [...pins.filter((k) => k !== key), key];
    setBusyKey(key);
    start(async () => {
      await supabase.auth.updateUser({ data: { portal_pins: next } });
      router.refresh();
      setBusyKey(null);
    });
  }

  return (
    <nav aria-label="Übersicht" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((t) => {
        const Icon = ICONS[t.key] ?? Map;
        const pinnable = !t.base && t.key !== "verkauf";
        return (
          <div
            key={t.key}
            className={`group relative flex flex-col rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-amber ${
              t.highlight ? "border-line bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.25)]" : "border-dashed border-line bg-ink-2/60"
            }`}
          >
            <a href={t.href} className="flex flex-1 flex-col after:absolute after:inset-0 after:content-['']">
              <Icon className="h-5 w-5 text-amber" strokeWidth={1.6} />
              <span className="mt-3 pr-8 font-display text-lg leading-tight text-ivory">{t.label}</span>
              <span className="mt-1 text-xs leading-snug text-ivory-dim">{t.status}</span>
            </a>
            {pinnable && (
              <button
                type="button"
                onClick={() => togglePin(t.key, Boolean(t.pinned))}
                disabled={pending && busyKey === t.key}
                aria-label={t.pinned ? `${t.label} lösen` : `${t.label} anheften`}
                title={t.pinned ? "Angeheftet: steht immer oben. Klicken zum Lösen." : "Anheften: steht dann immer oben"}
                className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                  t.pinned ? "border-amber bg-amber text-white" : "border-line bg-white text-ivory-dim hover:border-amber hover:text-amber"
                } ${pending && busyKey === t.key ? "opacity-50" : ""}`}
              >
                {t.pinned ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
