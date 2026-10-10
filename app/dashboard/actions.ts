"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sanitizeItems } from "@/lib/floorplan";

const OBJEKT_TYPES = ["Haus", "Wohnung", "Rendite", "Andere"];
const ZEITPUNKTE = ["sofort", "3-6 Monate", "6-12 Monate", "1-2 Jahre", "nur am Schauen"];

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function numberOrNull(value: FormDataEntryValue | null) {
  const n = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Überträgt das Suchprofil in die CRM-Kundenakte, damit das Team den
 * Interessenten sieht und Matching, Käufer-Radar und Käufer-Alarm ihn
 * kennen. Läuft mit dem Service-Role-Key, weil Kunden die CRM-Tabelle
 * selbst nicht schreiben dürfen.
 */
async function syncToCrm(userId: string, email: string, fullName: string | null, plan: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const admin = createSupabaseClient(url, key);

  const fields = {
    ziel: "kaufen",
    wunsch_ort: plan.wunsch_ort ?? null,
    objekt_typ: plan.objekt_typ ?? null,
    zimmer_min: plan.zimmer_min ?? null,
    budget_max: plan.budget_max ?? null,
    kauf_zeitpunkt: plan.kauf_zeitpunkt ?? null,
    alarm_opt_in: Boolean(plan.alarm_opt_in),
  };

  let customerId: string | null = null;
  const { data: linked } = await admin.from("customers").select("id").eq("portal_user_id", userId).maybeSingle();
  if (linked) {
    customerId = linked.id;
    await admin.from("customers").update(fields).eq("id", linked.id);
  } else {
    const { data: byEmail } = await admin.from("customers").select("id").ilike("email", email).limit(1).maybeSingle();
    if (byEmail) {
      customerId = byEmail.id;
      await admin.from("customers").update({ ...fields, portal_user_id: userId }).eq("id", byEmail.id);
    } else {
      const { data: created } = await admin
        .from("customers")
        .insert({ ...fields, full_name: fullName || email, email, typ: "neukunde", portal_user_id: userId })
        .select("id")
        .single();
      if (created) {
        customerId = created.id;
        await admin
          .from("customer_activity")
          .insert({ customer_id: created.id, type: "notiz", text: "Hat sich im Kundenportal registriert und ein Suchprofil angelegt" });
      }
    }
  }

  // Rolle separat setzen: fehlt die Spalte noch, bleibt der Abgleich oben trotzdem gültig.
  if (customerId) {
    const { data: row } = await admin.from("customers").select("rollen, quelle").eq("id", customerId).maybeSingle();
    const rollen = (row?.rollen as string[] | null) ?? null;
    if (rollen && !rollen.includes("kaeufer")) {
      await admin
        .from("customers")
        .update({ rollen: [...rollen, "kaeufer"], quelle: row?.quelle || "Kundenportal" })
        .eq("id", customerId);
    }
  }
}

export async function saveSearchProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Bitte melden Sie sich an." };

  const objektTyp = String(formData.get("objekt_typ") || "");
  const zeitpunkt = String(formData.get("kauf_zeitpunkt") || "");
  const plan = {
    user_id: user.id,
    wunsch_ort: String(formData.get("wunsch_ort") || "").trim().slice(0, 200) || null,
    objekt_typ: OBJEKT_TYPES.includes(objektTyp) ? objektTyp : null,
    zimmer_min: numberOrNull(formData.get("zimmer_min")),
    budget_max: numberOrNull(formData.get("budget_max")),
    kauf_zeitpunkt: ZEITPUNKTE.includes(zeitpunkt) ? zeitpunkt : null,
    alarm_opt_in: formData.get("alarm_opt_in") === "on",
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("customer_plans").upsert(plan);
  if (error) return { error: error.message };

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  await syncToCrm(user.id, user.email ?? "", profile?.full_name ?? null, plan);

  revalidatePath("/dashboard");
  return { error: null };
}

export async function saveFinanceCheck(input: { income: number; savings: number; pension: number; price: number }) {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Bitte melden Sie sich an." };
  const clean = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k, Number.isFinite(v) && v >= 0 && v < 1e9 ? Math.round(v) : 0])
  );
  const { error } = await supabase
    .from("customer_plans")
    .upsert({ user_id: user.id, finanz: { ...clean, saved_at: new Date().toISOString() }, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

export async function saveInsuranceCheck(answers: Record<string, string | boolean>) {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Bitte melden Sie sich an." };
  const { error } = await supabase
    .from("customer_plans")
    .upsert({ user_id: user.id, versicherung: answers, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  return { error: null };
}

export async function toggleFavorite(listingId: string) {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Bitte melden Sie sich an." };
  if (!/^[0-9a-f-]{36}$/i.test(listingId)) return { error: "Ungültiges Objekt." };

  const { data } = await supabase.from("customer_plans").select("favorites").eq("user_id", user.id).maybeSingle();
  const current: string[] = data?.favorites ?? [];
  const favorites = current.includes(listingId) ? current.filter((id) => id !== listingId) : [...current, listingId];
  const { error } = await supabase
    .from("customer_plans")
    .upsert({ user_id: user.id, favorites, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { error: null };
}

/**
 * Speichert eine Einrichtung aus dem Grundriss-Planer. Beim ersten Speichern
 * pro Objekt wird es in der CRM-Kundenakte vermerkt, damit das Team sieht,
 * wer sich ernsthaft für welches Objekt interessiert.
 */
export async function saveLayout(listingId: string, items: unknown) {
  const { supabase, user } = await requireUser();
  if (!supabase || !user) return { error: "Bitte melden Sie sich an." };
  if (listingId !== "demo" && !/^[0-9a-f-]{36}$/i.test(listingId)) return { error: "Ungültiges Objekt." };

  const clean = sanitizeItems(items);

  const { data } = await supabase.from("customer_plans").select("layouts").eq("user_id", user.id).maybeSingle();
  const layouts = (data?.layouts as Record<string, unknown> | null) ?? {};
  const firstTime = !layouts[listingId];
  const { error } = await supabase
    .from("customer_plans")
    .upsert({ user_id: user.id, layouts: { ...layouts, [listingId]: { items: clean, saved_at: new Date().toISOString() } }, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };

  if (firstTime) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      const admin = createSupabaseClient(url, key);
      const { data: customer } = await admin.from("customers").select("id").eq("portal_user_id", user.id).maybeSingle();
      if (customer) {
        let name = "die Beispielwohnung";
        if (listingId !== "demo") {
          const { data: listing } = await admin.from("listings").select("title, address, city").eq("id", listingId).maybeSingle();
          if (listing) name = listing.title || `${listing.address}, ${listing.city}`;
        }
        await admin
          .from("customer_activity")
          .insert({ customer_id: customer.id, type: "notiz", text: `Hat ${name} im Grundriss-Planer eingerichtet (${clean.length} Möbel)` });
      }
    }
  }

  return { error: null };
}
