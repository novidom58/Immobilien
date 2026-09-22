"use client";

import dynamic from "next/dynamic";

const CoverageMap = dynamic(() => import("./CoverageMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-ink-2">
      <span className="font-mono text-xs uppercase tracking-wide text-ivory-dim/50">
        Karte wird geladen…
      </span>
    </div>
  ),
});

export function CoverageNetwork() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-ink">
      <div aria-hidden className="pointer-events-none absolute left-3 top-3 z-[400] h-6 w-6 border-l border-t border-blueprint/40" />
      <div aria-hidden className="pointer-events-none absolute right-3 top-3 z-[400] h-6 w-6 border-r border-t border-blueprint/40" />
      <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 z-[400] h-6 w-6 border-b border-l border-blueprint/40" />
      <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 z-[400] h-6 w-6 border-b border-r border-blueprint/40" />
      <div className="h-[320px] w-full lg:h-[380px]">
        <CoverageMap />
      </div>
    </div>
  );
}
