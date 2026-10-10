import type { SupabaseClient } from "@supabase/supabase-js";
import { estimateValue, VALUATION_REGIONS, VALUATION_TYPES, type ValuationRegion, type ValuationType } from "@/lib/valuation";

// Wertmonitor: Eigentümer erhalten jedes Quartal einen Richtwert ihrer
// Immobilie. Das hält den Kontakt warm, lange bevor jemand verkauft.

export type OwnerInput = {
  region: ValuationRegion;
  typ: ValuationType;
  flaeche: number;
  zimmer: number | null;
  baujahr: number | null;
  adresse: string | null;
  hypo_ablauf: string | null;
  hypo_betrag: number | null;
};

/** Prüft und bereinigt Eingaben aus Formularen (öffentlich oder Portal). */
export function parseOwnerInput(raw: Record<string, unknown>): OwnerInput | null {
  const region = String(raw.region ?? "");
  const typ = String(raw.typ ?? "");
  const flaeche = Number(raw.flaeche);
  if (!(VALUATION_REGIONS as readonly string[]).includes(region)) return null;
  if (!(VALUATION_TYPES as readonly string[]).includes(typ)) return null;
  if (!Number.isFinite(flaeche) || flaeche < 20 || flaeche > 2000) return null;
  const zimmer = Number(raw.zimmer);
  const baujahr = Number(raw.baujahr);
  const ablauf = String(raw.hypo_ablauf ?? "");
  const betrag = Number(String(raw.hypo_betrag ?? "").replace(/[^\d]/g, ""));
  return {
    region: region as ValuationRegion,
    typ: typ as ValuationType,
    flaeche: Math.round(flaeche),
    zimmer: Number.isFinite(zimmer) && zimmer > 0 && zimmer < 30 ? zimmer : null,
    baujahr: Number.isInteger(baujahr) && baujahr > 1500 && baujahr <= new Date().getFullYear() + 2 ? baujahr : null,
    adresse: String(raw.adresse ?? "").trim().slice(0, 200) || null,
    hypo_ablauf: /^\d{4}-\d{2}-\d{2}$/.test(ablauf) ? ablauf : null,
    hypo_betrag: betrag > 0 && betrag < 1e8 ? betrag : null,
  };
}

/** Richtwert mit leichter Korrektur nach Baujahr. */
export function ownerValue(input: OwnerInput) {
  const base = estimateValue(input.region, input.typ, input.flaeche);
  const factor = !input.baujahr ? 1 : input.baujahr >= 2010 ? 1.06 : input.baujahr < 1975 ? 0.93 : 1;
  const round = (v: number) => Math.round((v * factor) / 1000) * 1000;
  return { low: round(base.low), mid: round(base.mid), high: round(base.high) };
}

/**
 * Legt den Eigentümer im CRM an oder ergänzt die bestehende Akte: Rolle
 * «Eigentümer», Wertmonitor-Daten und, falls angegeben, die Hypothek für
 * den Hypothekenwächter. Braucht einen Service-Role-Client.
 */
export async function upsertOwner(
  admin: SupabaseClient,
  person: { email: string; name: string; phone?: string | null; userId?: string | null },
  input: OwnerInput,
  quelle: string
) {
  const wert = ownerValue(input);
  const wertmonitor = {
    region: input.region,
    typ: input.typ,
    flaeche: input.flaeche,
    zimmer: input.zimmer,
    baujahr: input.baujahr,
    adresse: input.adresse,
    wert,
    last_sent_at: new Date().toISOString(),
  };
  const hypo = {
    ...(input.hypo_ablauf ? { hypo_ablauf: input.hypo_ablauf, hypo_erinnert_at: null } : {}),
    ...(input.hypo_betrag ? { hypo_betrag: input.hypo_betrag } : {}),
  };

  let existing: { id: string; rollen: string[] | null } | null = null;
  if (person.userId) {
    const { data } = await admin.from("customers").select("id, rollen").eq("portal_user_id", person.userId).maybeSingle();
    existing = data;
  }
  if (!existing) {
    const { data } = await admin.from("customers").select("id, rollen").ilike("email", person.email).limit(1).maybeSingle();
    existing = data;
  }

  if (existing) {
    const rollen = [...new Set([...(existing.rollen ?? []), "eigentuemer"])];
    await admin
      .from("customers")
      .update({ rollen, wertmonitor, ...hypo, ...(person.userId ? { portal_user_id: person.userId } : {}) })
      .eq("id", existing.id);
    await admin.from("customer_activity").insert({ customer_id: existing.id, type: "notiz", text: `Wertmonitor aktualisiert (${quelle})` });
    return { customerId: existing.id, wert, created: false };
  }

  const { data: created, error } = await admin
    .from("customers")
    .insert({
      full_name: person.name || person.email,
      email: person.email,
      phone: person.phone || null,
      address: input.adresse,
      typ: "neukunde",
      rollen: ["eigentuemer"],
      quelle,
      wertmonitor,
      ...hypo,
      ...(person.userId ? { portal_user_id: person.userId } : {}),
    })
    .select("id")
    .single();
  if (error || !created) return { customerId: null, wert, created: false };
  await admin.from("customer_activity").insert({ customer_id: created.id, type: "notiz", text: `Hat den Wertmonitor abonniert (${quelle})` });
  return { customerId: created.id as string, wert, created: true };
}
