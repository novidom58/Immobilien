"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";
import { AREAS, type AreaId } from "@/components/novidom360/areas";
import { AreaPanel } from "@/components/novidom360/AreaPanels";
import { Compass } from "@/components/novidom360/Compass";
import { PuzzleHub } from "@/components/novidom360/PuzzleHub";

export function SolutionsHub() {
  const [openId, setOpenId] = useState<AreaId | null>(null);
  const area = AREAS.find((a) => a.id === openId) ?? null;

  useEffect(() => {
    if (!openId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <section id="leistungen" className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center text-center">
          <SectionLabel>NoviDom 360°</SectionLabel>
          <h2 className="mt-6 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
            Eine Immobilie. <span className="text-amber-soft">Vier Lösungen.</span>
          </h2>
          <p className="mt-4 max-w-xl text-balance text-lg text-ivory-dim">
            Wählen Sie, wo Sie gerade stehen. Wir verbinden den Rest.
          </p>
        </div>

        <div className="mt-12">
          <PuzzleHub onSelect={setOpenId} />
          <p className="mt-6 hidden text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim/60 sm:block">
            Ein Teil wählen, um mehr zu erfahren
          </p>
        </div>

        <div className="mt-8 grid gap-2 sm:hidden">
          {AREAS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenId(a.id)}
              className="flex items-center gap-3 rounded-xl border border-line bg-ink px-4 py-3 text-left"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-blueprint">{a.num}</span>
              <a.icon className="h-4 w-4 text-amber-soft" strokeWidth={1.5} />
              <span className="font-display font-semibold text-ivory">{a.title}</span>
              <span className="ml-auto text-amber">→</span>
            </button>
          ))}
        </div>

        <Reveal className="mt-24 text-center">
          <h3 className="mx-auto max-w-3xl text-balance font-display text-2xl font-semibold leading-tight text-ivory lg:text-4xl">
            Warum vier Ansprechpartner, wenn <span className="text-amber-soft">einer alles verbinden kann?</span>
          </h3>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-ivory">
            <span>«Ich möchte meine Immobilie verkaufen»</span>
            <span aria-hidden className="text-amber">——————→</span>
            <span>«Ich habe mein neues Zuhause bezogen»</span>
          </div>
        </Reveal>
      </div>

      {area && (
        <div
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={area.title}
          onClick={(e) => e.target === e.currentTarget && setOpenId(null)}
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/80 px-4 pb-10 pt-[min(8vh,60px)] backdrop-blur-sm"
        >
          <div className="w-full max-w-4xl rounded-3xl border border-line bg-gradient-to-b from-ink-2 to-ink p-6 motion-safe:animate-[nd-pop_.3s_ease] lg:p-11">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-blueprint">
                <span aria-hidden className="h-px w-6 bg-blueprint/60" />
                {area.kicker}
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ivory-dim hover:border-amber/40 hover:text-amber-soft"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                Schliessen
              </button>
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold text-ivory lg:text-4xl">{area.title}</h2>
            <AreaPanel id={area.id} onNavigate={() => setOpenId(null)} />
          </div>
        </div>
      )}

      <Compass onSelect={setOpenId} />
    </section>
  );
}
