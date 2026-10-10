"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { Copy, Minus, Plus, RotateCw, Save, Trash2 } from "lucide-react";
import { FURNITURE, livingArea, roomArea, type FloorPlan, type FurnitureTemplate, type PlacedItem } from "@/lib/floorplan";
import { saveLayout } from "@/app/dashboard/actions";

const SNAP = 5; // cm
const ZOOMS = [1, 1.5, 2.2];

function snap(v: number) {
  return Math.round(v / SNAP) * SNAP;
}

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Möbel-Symbol im Grundriss-Stil, gezeichnet im eigenen Koordinatensystem (cm). */
function FurnitureShape({ item, selected }: { item: PlacedItem; selected: boolean }) {
  const { w, d, kind } = item;
  const stroke = selected ? "var(--color-amber)" : "#3d3a35";
  const fill = selected ? "rgba(143,106,57,0.18)" : "rgba(255,255,255,0.92)";
  const sw = selected ? 3 : 2;
  return (
    <g>
      {kind === "round" ? (
        <ellipse cx={w / 2} cy={d / 2} rx={w / 2} ry={d / 2} fill={fill} stroke={stroke} strokeWidth={sw} />
      ) : (
        <rect width={w} height={d} rx={kind === "sofa" ? 12 : 4} fill={fill} stroke={stroke} strokeWidth={sw} />
      )}
      {kind === "bed" && (
        <>
          <rect x={8} y={8} width={w / 2 - 12} height={Math.min(40, d * 0.2)} rx={6} fill="none" stroke={stroke} strokeWidth={1.5} />
          {w > 120 && <rect x={w / 2 + 4} y={8} width={w / 2 - 12} height={Math.min(40, d * 0.2)} rx={6} fill="none" stroke={stroke} strokeWidth={1.5} />}
          <line x1={0} y1={d * 0.35} x2={w} y2={d * 0.35} stroke={stroke} strokeWidth={1.5} />
        </>
      )}
      {kind === "sofa" && <rect x={0} y={0} width={w} height={Math.min(22, d * 0.28)} rx={10} fill="none" stroke={stroke} strokeWidth={1.5} />}
      {kind === "table" && <rect x={8} y={8} width={Math.max(0, w - 16)} height={Math.max(0, d - 16)} rx={3} fill="none" stroke={stroke} strokeWidth={1} />}
      {kind === "storage" && <line x1={0} y1={d} x2={w} y2={0} stroke={stroke} strokeWidth={1} />}
      {kind === "desk" && <rect x={w * 0.35} y={d - 4} width={w * 0.3} height={22} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />}
      {w >= 60 && d >= 40 && (
        <text x={w / 2} y={d / 2 + 6} textAnchor="middle" fontSize={Math.min(18, w / 6)} fill="#3d3a35" style={{ pointerEvents: "none" }}>
          {item.label}
        </text>
      )}
    </g>
  );
}

export function FloorPlanner({
  plan,
  listing,
  initialItems,
}: {
  plan: FloorPlan;
  listing: { id: string; title: string; price: number | null; isDemo: boolean };
  initialItems: PlacedItem[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [items, setItems] = useState<PlacedItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0);
  const [custom, setCustom] = useState({ label: "", w: "", d: "" });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [dirty, setDirty] = useState(false);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  // Auf dem Handy grösser starten, damit man die Möbel mit dem Finger trifft.
  useEffect(() => {
    if (window.innerWidth < 640) setZoom(1); // eslint-disable-line react-hooks/set-state-in-effect -- one-time viewport check after mount
  }, []);

  function toPlan(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  }

  function update(id: string, patch: Partial<PlacedItem>) {
    setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    setDirty(true);
    setSaveState("idle");
  }

  function add(t: FurnitureTemplate | { key: string; label: string; w: number; d: number; kind: "custom" }) {
    // Neues Möbel in die Mitte des Wohnbereichs, dann verschieben.
    const living = plan.rooms[0];
    const offset = (items.length % 6) * 30; // nicht alles auf denselben Punkt
    const item: PlacedItem = {
      id: newId(),
      key: t.key,
      label: t.label,
      kind: t.kind,
      w: t.w,
      d: t.d,
      x: snap(living.x + living.w / 2 - t.w / 2 + offset),
      y: snap(living.y + living.h / 2 - t.d / 2 + offset),
      rot: 0,
    };
    setItems((list) => [...list, item]);
    setSelectedId(item.id);
    setDirty(true);
    setSaveState("idle");
  }

  function onItemDown(e: ReactPointerEvent<SVGGElement>, item: PlacedItem) {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = toPlan(e);
    drag.current = { id: item.id, dx: p.x - item.x, dy: p.y - item.y };
    setSelectedId(item.id);
  }

  function onMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const p = toPlan(e);
    const { id, dx, dy } = drag.current;
    update(id, {
      x: snap(Math.min(plan.width, Math.max(-100, p.x - dx))),
      y: snap(Math.min(plan.height, Math.max(-100, p.y - dy))),
    });
  }

  function onUp() {
    drag.current = null;
  }

  async function handleSave() {
    setSaveState("saving");
    const res = await saveLayout(listing.id, items);
    setSaveState(res.error ? "error" : "saved");
    if (!res.error) setDirty(false);
  }

  function addCustom() {
    const w = Number(custom.w);
    const d = Number(custom.d);
    if (!custom.label.trim() || !(w >= 10 && w <= 800) || !(d >= 10 && d <= 800)) return;
    add({ key: "eigen", label: custom.label.trim().slice(0, 24), w, d, kind: "custom" });
    setCustom({ label: "", w: "", d: "" });
  }

  const scale = ZOOMS[zoom];
  const pad = 40;

  return (
    <div className="grid gap-5">
      {/* Möbel-Auswahl: horizontal scrollbar, gut mit dem Daumen */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FURNITURE.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => add(t)}
            className="shrink-0 rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ivory active:scale-95"
          >
            + {t.label}
            <span className="ml-1.5 text-xs text-ivory-dim">
              {t.w}×{t.d}
            </span>
          </button>
        ))}
      </div>

      <div className="relative overflow-auto rounded-2xl border border-line bg-white" style={{ maxHeight: "70svh" }}>
        <svg
          ref={svgRef}
          viewBox={`${-pad} ${-pad} ${plan.width + pad * 2} ${plan.height + pad * 2}`}
          style={{ width: `${scale * 100}%`, minWidth: scale > 1 ? `${scale * 100}%` : undefined, display: "block" }}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerDown={() => setSelectedId(null)}
          role="img"
          aria-label={`Grundriss ${listing.title}`}
        >
          <defs>
            <pattern id="deck" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 10 H20" stroke="#ddd5c6" strokeWidth="2" />
            </pattern>
          </defs>
          {plan.rooms.map((r) => (
            <g key={r.name}>
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                fill={r.outdoor ? "url(#deck)" : "#fbfaf7"}
                stroke="#191b1d"
                strokeWidth={r.outdoor ? 3 : 10}
                strokeDasharray={r.outdoor ? "14 10" : undefined}
              />
              <text x={r.x + r.w / 2} y={r.y + 34} textAnchor="middle" fontSize={22} fill="#5f6b78" style={{ pointerEvents: "none" }}>
                {r.name}
              </text>
              <text x={r.x + r.w / 2} y={r.y + 58} textAnchor="middle" fontSize={17} fill="#8a8f96" style={{ pointerEvents: "none" }}>
                {roomArea(r).toFixed(1)} m²
              </text>
            </g>
          ))}
          {plan.fixtures.map((f) => (
            <g key={`${f.x}-${f.y}`} style={{ pointerEvents: "none" }}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="#ece7dd" stroke="#8a8f96" strokeWidth={2} />
              {f.label && (
                <text x={f.x + f.w / 2} y={f.y + f.h / 2 + 6} textAnchor="middle" fontSize={16} fill="#5f6b78">
                  {f.label}
                </text>
              )}
            </g>
          ))}
          {items.map((item) => (
            <g
              key={item.id}
              transform={`translate(${item.x} ${item.y}) rotate(${item.rot} ${item.w / 2} ${item.d / 2})`}
              onPointerDown={(e) => onItemDown(e, item)}
              style={{ cursor: "grab", touchAction: "none" }}
            >
              <FurnitureShape item={item} selected={item.id === selectedId} />
            </g>
          ))}
          {/* Massstab 1 m */}
          <g transform={`translate(0 ${plan.height + 25})`} style={{ pointerEvents: "none" }}>
            <line x1={0} y1={0} x2={100} y2={0} stroke="#191b1d" strokeWidth={4} />
            <text x={110} y={6} fontSize={18} fill="#5f6b78">
              1 m
            </text>
          </g>
        </svg>

        <div className="sticky bottom-3 left-3 flex w-fit gap-1 rounded-full border border-line bg-white/95 p-1 shadow">
          <button type="button" aria-label="Verkleinern" disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))} className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-30">
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Vergrössern" disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))} className="flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-30">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Werkzeuge für das gewählte Möbel */}
      <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-2xl border border-line bg-ink-2 px-4 py-2.5">
        {selected ? (
          <>
            <span className="mr-auto text-sm text-ivory">
              <b>{selected.label}</b>{" "}
              <span className="text-ivory-dim">
                {selected.w} × {selected.d} cm
              </span>
            </span>
            <button type="button" onClick={() => update(selected.id, { rot: (((selected.rot + 90) % 360) as PlacedItem["rot"]) })} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm">
              <RotateCw className="h-4 w-4" /> Drehen
            </button>
            <button
              type="button"
              onClick={() => {
                const copy = { ...selected, id: newId(), x: selected.x + 20, y: selected.y + 20 };
                setItems((list) => [...list, copy]);
                setSelectedId(copy.id);
                setDirty(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm"
            >
              <Copy className="h-4 w-4" /> Kopie
            </button>
            <button
              type="button"
              onClick={() => {
                setItems((list) => list.filter((i) => i.id !== selected.id));
                setSelectedId(null);
                setDirty(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm text-red-700"
            >
              <Trash2 className="h-4 w-4" /> Entfernen
            </button>
          </>
        ) : (
          <span className="text-sm text-ivory-dim">Möbel oben antippen, dann mit dem Finger verschieben. Antippen zum Drehen oder Entfernen.</span>
        )}
      </div>

      {/* Eigenes Möbel nach Mass */}
      <details className="rounded-2xl border border-line bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ivory">Eigenes Möbel nach Mass hinzufügen</summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_100px_100px_auto]">
          <input value={custom.label} onChange={(e) => setCustom({ ...custom, label: e.target.value })} placeholder="z.B. Mein Sofa" aria-label="Name" className="rounded-xl border border-line bg-ink px-3 py-2.5" />
          <input value={custom.w} onChange={(e) => setCustom({ ...custom, w: e.target.value.replace(/\D/g, "") })} inputMode="numeric" placeholder="Breite cm" aria-label="Breite in cm" className="rounded-xl border border-line bg-ink px-3 py-2.5" />
          <input value={custom.d} onChange={(e) => setCustom({ ...custom, d: e.target.value.replace(/\D/g, "") })} inputMode="numeric" placeholder="Tiefe cm" aria-label="Tiefe in cm" className="rounded-xl border border-line bg-ink px-3 py-2.5" />
          <button type="button" onClick={addCustom} className="rounded-full bg-night px-5 py-2.5 text-sm font-semibold text-ink">
            Hinzufügen
          </button>
        </div>
        <p className="mt-2 text-xs text-ivory-dim">Tipp: Messen Sie Ihr Lieblingsmöbel aus, dann sehen Sie sofort, ob es passt.</p>
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="inline-flex items-center gap-2 rounded-full bg-night px-6 py-3 text-sm font-semibold text-ink hover:bg-amber disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saveState === "saving" ? "Speichert …" : "Einrichtung speichern"}
        </button>
        {saveState === "saved" && <span className="text-sm text-emerald-700">Gespeichert.</span>}
        {saveState === "error" && <span className="text-sm text-red-700">Speichern fehlgeschlagen.</span>}
        {dirty && saveState === "idle" && <span className="text-sm text-ivory-dim">Nicht gespeicherte Änderungen</span>}
        <span className="ml-auto text-sm text-ivory-dim">
          {livingArea(plan).toFixed(0)} m² Wohnfläche · {items.length} Möbel
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {listing.price && (
          <Link href={`/dashboard?preis=${listing.price}#finanzierung`} className="rounded-2xl border border-line bg-white p-4 text-sm hover:border-amber">
            <b className="block text-ivory">Finanzierung prüfen</b>
            <span className="text-ivory-dim">Passt der Preis zu Ihrem Budget?</span>
          </Link>
        )}
        <Link href="/leistungen/umbauen#kontakt" className="rounded-2xl border border-line bg-white p-4 text-sm hover:border-amber">
          <b className="block text-ivory">Umbau-Idee?</b>
          <span className="text-ivory-dim">Küche oder Bad anders? Wir rechnen es durch.</span>
        </Link>
        {!listing.isDemo && (
          <Link href={`/immobilien/${listing.id}#anfragen`} className="rounded-2xl border border-line bg-white p-4 text-sm hover:border-amber">
            <b className="block text-ivory">Besichtigung anfragen</b>
            <span className="text-ivory-dim">Jetzt in echt anschauen.</span>
          </Link>
        )}
      </div>
    </div>
  );
}
