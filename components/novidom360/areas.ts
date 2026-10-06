import { Coins, Hammer, Home, ShieldCheck, type LucideIcon } from "lucide-react";

export type AreaId = "kv" | "umbau" | "fin" | "vers";

export const AREAS: {
  id: AreaId;
  num: string;
  title: string;
  short: string;
  compassLabel: string;
  kicker: string;
  icon: LucideIcon;
}[] = [
  { id: "kv", num: "01", title: "Verkaufen & Kaufen", short: "Von der Bewertung bis zum Schlüssel.", compassLabel: "Verkaufen / Kaufen", kicker: "01 — Kaufen & Verkaufen", icon: Home },
  { id: "umbau", num: "02", title: "Umbauen", short: "Vorher / Nachher, koordiniert.", compassLabel: "Umbauen", kicker: "02 — Umbauen & Aufwerten", icon: Hammer },
  { id: "fin", num: "03", title: "Finanzieren", short: "Mit Hypocasa, direkt beim Kauf.", compassLabel: "Finanzieren", kicker: "03 — Mit Hypocasa", icon: Coins },
  { id: "vers", num: "04", title: "Versichern", short: "Der letzte Schritt zum Zuhause.", compassLabel: "Versichern", kicker: "04 — Rundum abgesichert", icon: ShieldCheck },
];
