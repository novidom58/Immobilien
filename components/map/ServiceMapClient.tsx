"use client";

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

export function ServiceMapClient({ listings }: { listings: MapListing[] }) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-line lg:h-[520px]">
      <MapCanvas listings={listings} />
    </div>
  );
}
