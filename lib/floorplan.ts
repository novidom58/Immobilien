// Grundriss-Planer: alle Masse in Zentimetern. Der Beispielplan ist eine
// 5.5-Zimmer-Wohnung mit rund 131 m², bis echte Giraffe360-Pläne pro Objekt
// hinterlegt sind.

export type Room = { name: string; x: number; y: number; w: number; h: number; outdoor?: boolean };
export type Fixture = { x: number; y: number; w: number; h: number; label?: string };

export type FloorPlan = {
  width: number;
  height: number;
  rooms: Room[];
  fixtures: Fixture[];
};

export const SAMPLE_PLAN: FloorPlan = {
  width: 1680,
  height: 1000,
  rooms: [
    { name: "Wohnen / Essen / Küche", x: 500, y: 0, w: 800, h: 600 },
    { name: "Zimmer 1", x: 0, y: 0, w: 500, h: 380 },
    { name: "Korridor", x: 0, y: 380, w: 750, h: 160 },
    { name: "Zimmer 2", x: 0, y: 540, w: 380, h: 460 },
    { name: "Zimmer 3", x: 380, y: 540, w: 370, h: 460 },
    { name: "Bad", x: 750, y: 600, w: 250, h: 220 },
    { name: "Dusche / WC", x: 750, y: 820, w: 250, h: 180 },
    { name: "Zimmer 4", x: 1000, y: 600, w: 300, h: 400 },
    { name: "Terrasse", x: 1320, y: 0, w: 360, h: 600, outdoor: true },
  ],
  fixtures: [
    { x: 520, y: 75, w: 300, h: 60, label: "Küche" },
    { x: 560, y: 200, w: 220, h: 90, label: "Insel" },
    { x: 770, y: 735, w: 170, h: 75, label: "Wanne" },
    { x: 900, y: 900, w: 90, h: 90, label: "Dusche" },
  ],
};

export type FurnitureKind = "bed" | "sofa" | "table" | "chair" | "storage" | "desk" | "round" | "custom";

export type FurnitureTemplate = { key: string; label: string; w: number; d: number; kind: FurnitureKind };

export const FURNITURE: FurnitureTemplate[] = [
  { key: "doppelbett", label: "Doppelbett 160", w: 160, d: 200, kind: "bed" },
  { key: "bett180", label: "Doppelbett 180", w: 180, d: 200, kind: "bed" },
  { key: "einzelbett", label: "Einzelbett", w: 90, d: 200, kind: "bed" },
  { key: "kinderbett", label: "Kinderbett", w: 70, d: 140, kind: "bed" },
  { key: "sofa", label: "Sofa 3er", w: 220, d: 95, kind: "sofa" },
  { key: "ecksofa", label: "Ecksofa", w: 270, d: 180, kind: "sofa" },
  { key: "sessel", label: "Sessel", w: 80, d: 85, kind: "sofa" },
  { key: "esstisch", label: "Esstisch 6 P.", w: 180, d: 90, kind: "table" },
  { key: "rundtisch", label: "Runder Tisch", w: 110, d: 110, kind: "round" },
  { key: "couchtisch", label: "Couchtisch", w: 110, d: 60, kind: "table" },
  { key: "stuhl", label: "Stuhl", w: 45, d: 50, kind: "chair" },
  { key: "schrank", label: "Kleiderschrank", w: 200, d: 60, kind: "storage" },
  { key: "kommode", label: "Kommode", w: 120, d: 45, kind: "storage" },
  { key: "tv", label: "TV-Möbel", w: 180, d: 40, kind: "storage" },
  { key: "regal", label: "Regal", w: 100, d: 35, kind: "storage" },
  { key: "schreibtisch", label: "Schreibtisch", w: 140, d: 70, kind: "desk" },
];

export type PlacedItem = {
  id: string;
  key: string;
  label: string;
  kind: FurnitureKind;
  w: number;
  d: number;
  x: number;
  y: number;
  rot: 0 | 90 | 180 | 270;
};

export function roomArea(room: Room) {
  return (room.w * room.h) / 10000;
}

export function livingArea(plan: FloorPlan) {
  return plan.rooms.filter((r) => !r.outdoor).reduce((sum, r) => sum + roomArea(r), 0);
}

/** Prüft gespeicherte Daten, bevor sie in den Planer geladen werden. */
export function sanitizeItems(value: unknown): PlacedItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is PlacedItem => typeof v === "object" && v !== null && typeof (v as PlacedItem).x === "number")
    .slice(0, 200)
    .map((v) => ({
      id: String(v.id).slice(0, 40),
      key: String(v.key).slice(0, 40),
      label: String(v.label).slice(0, 40),
      kind: (["bed", "sofa", "table", "chair", "storage", "desk", "round", "custom"] as const).includes(v.kind) ? v.kind : "custom",
      w: Math.min(800, Math.max(10, Number(v.w) || 50)),
      d: Math.min(800, Math.max(10, Number(v.d) || 50)),
      x: Math.min(5000, Math.max(-500, Number(v.x) || 0)),
      y: Math.min(5000, Math.max(-500, Number(v.y) || 0)),
      rot: ([0, 90, 180, 270] as const).includes(v.rot) ? v.rot : 0,
    }));
}
