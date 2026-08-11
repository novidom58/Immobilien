"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { MapListing } from "./MapCanvas";

const MapCanvas = dynamic(() => import("./MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-ink-2">
      <span className="font-mono text-xs uppercase tracking-wide text-ivory-dim/50">
        Karte wird geladen…
      </span>
    </div>
  ),
});

const TYPE_OPTIONS = ["Alle", "Haus", "Wohnung", "Stockwerkeigentum", "Rendite", "Andere"] as const;
const PRICE_OPTIONS = [
  { label: "Alle Preise", min: 0, max: Infinity },
  { label: "bis CHF 800'000", min: 0, max: 800_000 },
  { label: "bis CHF 1.2 Mio.", min: 0, max: 1_200_000 },
  { label: "bis CHF 2 Mio.", min: 0, max: 2_000_000 },
  { label: "über CHF 2 Mio.", min: 2_000_000, max: Infinity },
];

const selectClasses =
  "rounded-lg border border-line bg-ink-2 px-3 py-1.5 text-xs text-ivory focus:border-amber focus:outline-none";

export function ServiceMapClient({ listings }: { listings: MapListing[] }) {
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("Alle");
  const [priceLabel, setPriceLabel] = useState(PRICE_OPTIONS[0].label);
  const priceRange = PRICE_OPTIONS.find((p) => p.label === priceLabel) ?? PRICE_OPTIONS[0];

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (type !== "Alle" && l.property_type !== type) return false;
      const price = l.price_chf ?? 0;
      if (price < priceRange.min || price > priceRange.max) return false;
      return true;
    });
  }, [listings, type, priceRange]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as (typeof TYPE_OPTIONS)[number])} className={selectClasses}>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={priceLabel}
          onChange={(e) => setPriceLabel(e.target.value)}
          className={selectClasses}
        >
          {PRICE_OPTIONS.map((p) => (
            <option key={p.label} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="ml-auto self-center font-mono text-[11px] uppercase tracking-wide text-ivory-dim/50">
          {filtered.length} {filtered.length === 1 ? "Objekt" : "Objekte"}
        </span>
      </div>
      <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-line lg:h-[520px]">
        <MapCanvas listings={filtered} />
      </div>
    </div>
  );
}
