import type { ValuationRegion } from "@/lib/valuation";

/** Grobe Zuordnung einer Postleitzahl zur Bewertungsregion (Richtwert). */
export function regionFromPostal(postal: string | null, city: string): ValuationRegion {
  const plz = Number(String(postal ?? "").replace(/\D/g, "").slice(0, 4));
  const c = city.toLowerCase();
  if ((plz >= 4000 && plz <= 4059) || plz === 4125 || plz === 4126 || c === "basel" || c === "riehen" || c === "bettingen") return "Basel-Stadt";
  if (plz >= 6300 && plz <= 6349) return "Zug";
  if (plz >= 4100 && plz <= 4499) return "Basel-Landschaft";
  if (plz >= 4500 && plz <= 4799) return "Solothurn";
  return "Andere";
}
