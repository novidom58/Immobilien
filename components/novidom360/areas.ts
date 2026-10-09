import { Coins, Hammer, Home, ShieldCheck, type LucideIcon } from "lucide-react";

export type AreaId = "kv" | "fin" | "umbau" | "vers";

// Reihenfolge = Lebenszyklus einer Immobilie: kaufen/verkaufen, finanzieren,
// umbauen, absichern. Bestimmt die Puzzle- und Kompass-Positionen.
export const AREAS: {
  id: AreaId;
  slug: string;
  num: string;
  title: string;
  short: string;
  compassLabel: string;
  kicker: string;
  icon: LucideIcon;
}[] = [
  { id: "kv", slug: "kaufen-verkaufen", num: "01", title: "Kaufen & Verkaufen", short: "Von der Bewertung bis zum Schlüssel.", compassLabel: "Kaufen / Verkaufen", kicker: "01 — Kaufen & Verkaufen", icon: Home },
  { id: "fin", slug: "finanzieren", num: "02", title: "Finanzieren", short: "Mit Hypocasa, direkt beim Kauf.", compassLabel: "Finanzieren", kicker: "02 — Mit Hypocasa", icon: Coins },
  { id: "umbau", slug: "umbauen", num: "03", title: "Umbauen", short: "Vorher / Nachher, koordiniert.", compassLabel: "Umbauen", kicker: "03 — Umbauen & Aufwerten", icon: Hammer },
  { id: "vers", slug: "versichern", num: "04", title: "Versichern", short: "Der letzte Schritt zum Zuhause.", compassLabel: "Versichern", kicker: "04 — Rundum abgesichert", icon: ShieldCheck },
];

export function areaHref(id: AreaId) {
  const area = AREAS.find((a) => a.id === id);
  return `/leistungen/${area?.slug ?? ""}`;
}
