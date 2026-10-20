"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";

export type BeforeAfterItem = { key: string; title: string; text: string; cost: string; before: string; after: string };

/**
 * Vorher/Nachher zum Wischen: Finger oder Maus über das Bild ziehen, der
 * Regler folgt. Funktioniert auch mit der Tastatur (Pfeiltasten).
 */
export function BeforeAfterSlider({ before, after, label }: { before: string; after: string; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  function moveTo(clientX: number) {
    const el = box.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }

  function down(e: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  }

  return (
    <div
      ref={box}
      className="relative aspect-[4/3] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl bg-ink-3"
      onPointerDown={down}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <Image src={before} alt={`${label} heute`} fill sizes="(min-width: 1024px) 760px, 100vw" className="pointer-events-none object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
        <Image src={after} alt={`${label} nach dem Umbau (Visualisierung)`} fill sizes="(min-width: 1024px) 760px, 100vw" className="pointer-events-none object-cover" draggable={false} />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-night/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">Heute</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-amber px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">Nachher</span>
      <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] text-night">Visualisierung</span>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]" style={{ left: `${split}%` }}>
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-semibold text-night shadow-lg">
          ↔
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(split)}
        onChange={(e) => setSplit(Number(e.target.value))}
        aria-label={`Vorher/Nachher ${label}`}
        className="sr-only"
      />
    </div>
  );
}

/** Mehrere Räume zum Durchklicken, je mit Wisch-Vergleich, Idee und Richtpreis. */
export function BeforeAfterShowcase({ items }: { items: BeforeAfterItem[] }) {
  const [active, setActive] = useState(0);
  const item = items[active];
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-blueprint">Vorher / Nachher</div>
      <h2 className="mb-3 mt-6 font-display text-3xl text-ivory lg:text-4xl">
        Wischen Sie <em>durch den Umbau.</em>
      </h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ivory-dim">
        Eine echte Wohnung, heute und als Visualisierung nach dem Umbau. Ziehen Sie den Regler über das Bild.
      </p>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {items.map((it, i) => (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${i === active ? "bg-night text-ink" : "border border-line bg-white text-ivory hover:border-ivory"}`}
          >
            {it.title.split(":")[0]}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <BeforeAfterSlider key={item.key} before={item.before} after={item.after} label={item.title.split(":")[0]} />
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="font-display text-2xl text-ivory">{item.title}</div>
          <p className="mt-2 leading-relaxed text-ivory-dim">{item.text}</p>
          <div className="mt-4 font-mono text-xs tracking-[0.06em] text-amber">{item.cost}</div>
          <a href="#kontakt" className="mt-6 inline-flex rounded-full bg-night px-5 py-3 text-sm font-semibold text-ink hover:bg-amber">
            So etwas für mein Zuhause
          </a>
          <p className="mt-4 text-xs text-ivory-dim">Nachher-Bilder sind KI-Visualisierungen zur Veranschaulichung, keine Fotos eines ausgeführten Umbaus.</p>
        </div>
      </div>
    </section>
  );
}
