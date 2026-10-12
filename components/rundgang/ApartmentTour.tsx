"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Footprints, Sofa } from "lucide-react";
import { roomArea, livingArea, type FloorPlan, type PlacedItem } from "@/lib/floorplan";
import { FloorPlanner } from "@/components/portal/FloorPlanner";

export type TourStop = { room: string; text: string };

/**
 * Rundgang durch einen Grundriss: Raum für Raum, per Tippen auf den Plan,
 * mit Weiter/Zurück oder automatisch. Im zweiten Modus kann man die Wohnung
 * gleich selbst einrichten.
 */
export function ApartmentTour({
  plan,
  stops,
  rooms,
  initialItems,
  guestLoginHref,
}: {
  plan: FloorPlan;
  stops: TourStop[];
  rooms: string;
  initialItems: PlacedItem[];
  guestLoginHref?: string;
}) {
  const [mode, setMode] = useState<"rundgang" | "einrichten">("rundgang");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % stops.length), 3500);
    return () => clearInterval(t);
  }, [playing, stops.length]);

  const stop = stops[index];
  const current = plan.rooms.find((r) => r.name === stop.room);
  const outdoor = plan.rooms.filter((r) => r.outdoor).reduce((s, r) => s + roomArea(r), 0);
  const pad = 30;

  function go(delta: number) {
    setPlaying(false);
    setIndex((i) => (i + delta + stops.length) % stops.length);
  }

  function pick(name: string) {
    const i = stops.findIndex((s) => s.room === name);
    if (i >= 0) {
      setPlaying(false);
      setIndex(i);
    }
  }

  const tab = (m: typeof mode, label: string, Icon: typeof Sofa) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => setMode(m)}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
        mode === m ? "bg-night text-ink" : "border border-line bg-white text-ivory hover:border-ivory"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="tablist">
          {tab("rundgang", "Rundgang", Footprints)}
          {tab("einrichten", "Selbst einrichten", Sofa)}
        </div>
        <div className="flex gap-4 text-sm text-ivory-dim">
          <span>
            <b className="text-ivory">{rooms}</b> Zimmer
          </span>
          <span>
            ca. <b className="text-ivory">{Math.round(livingArea(plan))} m²</b> Wohnfläche
          </span>
          {outdoor > 0 && <span>ca. {Math.round(outdoor)} m² Balkon</span>}
        </div>
      </div>

      {mode === "einrichten" ? (
        <div className="mt-6">
          <FloorPlanner
            plan={plan}
            listing={{ id: "rundgang", title: "Wohnung 3.5 Zimmer", price: null, isDemo: true }}
            initialItems={initialItems}
            guestLoginHref={guestLoginHref}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <svg viewBox={`${-pad} ${-pad} ${plan.width + pad * 2} ${plan.height + pad * 2}`} className="block h-auto w-full" role="img" aria-label="Grundriss der Wohnung">
              <defs>
                <pattern id="tour-deck" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="24" stroke="#d9d2c5" strokeWidth="6" />
                </pattern>
              </defs>
              {plan.rooms.map((r) => {
                const active = r === current;
                return (
                  <g key={r.name} onClick={() => pick(r.name)} style={{ cursor: "pointer" }}>
                    <rect
                      x={r.x}
                      y={r.y}
                      width={r.w}
                      height={r.h}
                      fill={active ? "#8f6a39" : r.outdoor ? "url(#tour-deck)" : "#fbfaf7"}
                      fillOpacity={active ? 0.22 : 1}
                      stroke="#191b1d"
                      strokeWidth={r.outdoor ? 3 : 10}
                      strokeDasharray={r.outdoor ? "14 10" : undefined}
                      style={{ transition: "fill 400ms, fill-opacity 400ms" }}
                    />
                    <text x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle" fontSize={r.w < 220 ? 26 : 32} fontWeight={active ? 700 : 500} fill="#191b1d">
                      {r.name}
                    </text>
                    <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 34} textAnchor="middle" fontSize="24" fill="#5f6b78">
                      ca. {roomArea(r).toFixed(1)} m²
                    </text>
                  </g>
                );
              })}
              {plan.fixtures.map((f) => (
                <rect key={`${f.x}-${f.y}`} x={f.x} y={f.y} width={f.w} height={f.h} rx="6" fill="none" stroke="#9aa3ad" strokeWidth="3" pointerEvents="none" />
              ))}
              {current && (
                <circle cx={current.x + current.w / 2} cy={current.y + current.h / 2 - 60} r="16" fill="#8f6a39">
                  <animate attributeName="r" values="14;20;14" dur="1.6s" repeatCount="indefinite" />
                </circle>
              )}
            </svg>
          </div>

          <div className="grid gap-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-white p-6" aria-live="polite">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ivory-dim">
                Raum {index + 1} von {stops.length}
              </div>
              <div className="mt-2 font-display text-3xl text-ivory">{stop.room}</div>
              {current && <div className="mt-1 text-sm text-amber">ca. {roomArea(current).toFixed(1)} m²</div>}
              <p className="mt-3 leading-relaxed text-ivory-dim">{stop.text}</p>
              <div className="mt-5 flex items-center gap-2">
                <button type="button" onClick={() => go(-1)} aria-label="Vorheriger Raum" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-ivory">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-night px-5 text-sm font-semibold text-ink hover:bg-amber"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? "Pause" : "Automatisch"}
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Nächster Raum" className="flex h-11 w-11 items-center justify-center rounded-full border border-line hover:border-ivory">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap">
              {stops.map((s, i) => (
                <button
                  key={s.room}
                  type="button"
                  onClick={() => pick(s.room)}
                  aria-current={i === index}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-sm ${i === index ? "border-amber bg-amber/10 text-amber" : "border-line bg-white text-ivory-dim"}`}
                >
                  {s.room}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMode("einrichten")}
              className="rounded-2xl border border-dashed border-amber/60 bg-white p-4 text-left text-sm hover:border-amber"
            >
              <b className="block text-ivory">Wie würde es mit Ihren Möbeln aussehen?</b>
              <span className="text-ivory-dim">Bett, Sofa und Tisch massstabsgetreu in den Plan ziehen.</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
