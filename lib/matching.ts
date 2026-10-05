import type { CrmCustomer, AdminListing } from "@/lib/admin-data";

export function matchListings(customer: CrmCustomer, listings: AdminListing[]): AdminListing[] {
  if (customer.ziel !== "kaufen") return [];
  const hasCriteria = customer.budget_min || customer.budget_max || customer.wunsch_ort || customer.objekt_typ || customer.zimmer_min || customer.wohnflaeche_min;
  if (!hasCriteria) return [];

  const wunschOrte = customer.wunsch_ort
    ? customer.wunsch_ort
        .split(",")
        .map((o) => o.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return listings.filter((l) => {
    if (l.status !== "active" && l.status !== "reserved") return false;
    if (customer.budget_min && (l.price_chf ?? 0) < customer.budget_min) return false;
    if (customer.budget_max && (l.price_chf ?? Infinity) > customer.budget_max) return false;
    if (customer.objekt_typ && l.property_type !== customer.objekt_typ) return false;
    if (customer.zimmer_min && (l.rooms ?? 0) < customer.zimmer_min) return false;
    if (customer.wohnflaeche_min && (l.living_area ?? 0) < customer.wohnflaeche_min) return false;
    if (wunschOrte.length > 0 && !wunschOrte.some((o) => l.city.toLowerCase().includes(o))) return false;
    return true;
  });
}
