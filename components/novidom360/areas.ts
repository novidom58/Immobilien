import { Coins, Hammer, Home, ShieldCheck, type LucideIcon } from "lucide-react";

export type AreaId = "kv" | "fin" | "umbau" | "vers";

// Reihenfolge bestimmt die Puzzle- und Kompass-Positionen (ab 12 Uhr im
// Uhrzeigersinn): oben die Immobilie selbst (01 Kaufen & Verkaufen rechts,
// 04 Umbauen links), unten die Finanzen (02 Finanzieren, 03 Versichern).
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
  { id: "vers", slug: "versichern", num: "03", title: "Versichern", short: "Der letzte Schritt zum Zuhause.", compassLabel: "Versichern", kicker: "03 — Rundum abgesichert", icon: ShieldCheck },
  { id: "umbau", slug: "umbauen", num: "04", title: "Umbauen", short: "Vorher / Nachher, koordiniert.", compassLabel: "Umbauen", kicker: "04 — Umbauen & Aufwerten", icon: Hammer },
];

export function areaHref(id: AreaId) {
  const area = AREAS.find((a) => a.id === id);
  return `/leistungen/${area?.slug ?? ""}`;
}
