import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { suggestRoles } from "@/lib/constants";

type LeadForCrm = {
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string | null;
  listing_id: string | null;
  wants_financing: boolean;
  anliegen: string | null;
  profile: Record<string, unknown> | null;
};

const ZIEL: Record<string, string> = { verkaufen: "verkaufen", kaufen: "kaufen" };

function clean(profile: Record<string, unknown> | null) {
  if (!profile) return {};
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 && v < 1e9 ? v : null);
  const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
  const date = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  const out: Record<string, unknown> = {
    wunsch_ort: str(profile.wunsch_ort),
    objekt_typ: str(profile.objekt_typ, 40),
    budget_max: num(profile.budget_max),
    zimmer_min: num(profile.zimmer_min),
    kauf_zeitpunkt: str(profile.kauf_zeitpunkt, 40),
    hypo_ablauf: date(profile.hypo_ablauf),
    hypo_betrag: num(profile.hypo_betrag),
  };
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== null));
}

/**
 * Jede Anfrage landet sofort in der Kundenakte: neue Person anlegen oder
 * bestehende (gleiche E-Mail) ergänzen, mit Rollen, Quelle und den Angaben
 * aus dem Formular. Braucht den Service-Role-Key, sonst passiert nichts.
 */
export async function syncLeadToCrm(lead: LeadForCrm) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const admin = createSupabaseClient(url, key);

  const rollen = suggestRoles(lead);
  const fields = clean(lead.profile);
  const ziel = lead.anliegen ? ZIEL[lead.anliegen] : undefined;
  const note = `Anfrage über die Webseite${lead.anliegen ? ` (${lead.anliegen})` : ""}${lead.message ? `:\n${lead.message}` : ""}`;

  const { data: existing } = await admin.from("customers").select("id, rollen, ziel").ilike("email", lead.email).limit(1).maybeSingle();
  if (existing) {
    const merged = [...new Set([...((existing.rollen as string[] | null) ?? []), ...rollen])];
    // Bestehende Angaben nicht überschreiben, nur fehlende ergänzen.
    const { data: row } = await admin.from("customers").select("*").eq("id", existing.id).single();
    const missing = Object.fromEntries(Object.entries(fields).filter(([k]) => row && (row as Record<string, unknown>)[k] == null));
    await admin
      .from("customers")
      .update({ rollen: merged, ...missing, ...(!existing.ziel && ziel ? { ziel } : {}), ...(lead.phone && row && !row.phone ? { phone: lead.phone } : {}) })
      .eq("id", existing.id);
    await admin.from("customer_activity").insert({ customer_id: existing.id, type: "notiz", text: note.slice(0, 2000) });
    return;
  }

  const { data: created } = await admin
    .from("customers")
    .insert({
      full_name: lead.name,
      email: lead.email,
      phone: lead.phone,
      typ: "neukunde",
      rollen,
      quelle: lead.source || "Website",
      listing_id: lead.listing_id,
      ...(ziel ? { ziel } : {}),
      ...fields,
    })
    .select("id")
    .single();
  if (created) await admin.from("customer_activity").insert({ customer_id: created.id, type: "notiz", text: note.slice(0, 2000) });
}
