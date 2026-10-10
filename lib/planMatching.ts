export type PlanProfile = {
  wunsch_ort: string | null;
  objekt_typ: string | null;
  zimmer_min: number | null;
  budget_max: number | null;
};

export type MatchableListing = {
  city: string;
  property_type: string | null;
  rooms: number | null;
  price_chf: number | null;
};

// Eigentumswohnung wird im CRM teils als "Stockwerkeigentum" erfasst.
function sameType(a: string, b: string) {
  const norm = (t: string) => (t === "Stockwerkeigentum" ? "Wohnung" : t);
  return norm(a) === norm(b);
}

/** Passt ein Objekt zum Suchprofil aus dem Kundenportal? 10% Budget-Toleranz. */
export function matchesPlan(plan: PlanProfile | null, l: MatchableListing) {
  if (!plan) return false;
  if (!plan.wunsch_ort && !plan.objekt_typ && !plan.zimmer_min && !plan.budget_max) return false;
  const orte = (plan.wunsch_ort ?? "")
    .split(",")
    .map((o) => o.trim().toLowerCase())
    .filter(Boolean);
  if (orte.length > 0 && !orte.some((o) => l.city.toLowerCase().includes(o) || o.includes(l.city.toLowerCase()))) return false;
  if (plan.objekt_typ && l.property_type && !sameType(plan.objekt_typ, l.property_type)) return false;
  if (plan.zimmer_min && (l.rooms ?? 0) < plan.zimmer_min) return false;
  if (plan.budget_max && l.price_chf && l.price_chf > plan.budget_max * 1.1) return false;
  return true;
}
