"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/roles";
import { HYPO_ERTRAG_PCT } from "@/lib/karriere";

type Result = { error: string | null };

async function staffClient() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, staff: null };
  const staff = await getStaff(supabase);
  return { supabase, staff };
}

const num = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/['’\s]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Versicherungs- oder Hypothekar-Abschluss erfassen. Mitarbeitende erfassen
 * für sich selbst (zählt nach Bestätigung durch einen Partner), Partner für
 * eine beliebige Person (gilt sofort als bestätigt).
 */
export async function addErtrag(formData: FormData): Promise<Result> {
  const { supabase, staff } = await staffClient();
  if (!supabase || !staff) return { error: "Keine Berechtigung." };

  const berater = staff.role === "admin" ? String(formData.get("berater") ?? "").trim() : staff.berater;
  if (!berater) return { error: "Kein Berater zugeordnet." };

  const art = formData.get("art") === "hypothek" ? "hypothek" : "versicherung";
  const volumen = num(formData.get("volumen"));
  let ertrag = num(formData.get("ertrag"));
  if (!ertrag && art === "hypothek" && volumen) ertrag = Math.round((volumen * HYPO_ERTRAG_PCT) / 100);
  if (!ertrag && !volumen) return { error: art === "hypothek" ? "Bitte Volumen oder Entschädigung angeben." : "Bitte Prämie oder Courtage angeben." };

  const datum = String(formData.get("datum") ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("staff_ertraege").insert({
    berater,
    art,
    kunde: String(formData.get("kunde") ?? "").trim() || null,
    volumen_chf: volumen,
    ertrag_chf: ertrag,
    abgeschlossen_am: datum,
    notiz: String(formData.get("notiz") ?? "").trim() || null,
    bestaetigt_am: staff.role === "admin" && ertrag ? new Date().toISOString() : null,
  });
  if (error) {
    return { error: /staff_ertraege/.test(error.message) ? "Bitte zuerst in Supabase das SQL «Karriere» ausführen." : error.message };
  }
  revalidatePath("/admin/karriere");
  return { error: null };
}

/** Partner bestätigen einen Eintrag und legen den definitiven Ertrag fest. */
export async function confirmErtrag(formData: FormData): Promise<Result> {
  const { supabase, staff } = await staffClient();
  if (!supabase || staff?.role !== "admin") return { error: "Nur Partner können bestätigen." };
  const id = String(formData.get("id") ?? "");
  const ertrag = num(formData.get("ertrag"));
  if (!id || !ertrag) return { error: "Bitte den Ertrag in CHF angeben." };
  const { error } = await supabase
    .from("staff_ertraege")
    .update({ ertrag_chf: ertrag, bestaetigt_am: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/karriere");
  return { error: null };
}

/** Löschen: Partner immer, Mitarbeitende nur eigene, noch nicht bestätigte. */
export async function deleteErtrag(formData: FormData): Promise<Result> {
  const { supabase, staff } = await staffClient();
  if (!supabase || !staff) return { error: "Keine Berechtigung." };
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("staff_ertraege").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/karriere");
  return { error: null };
}

/** Freelancer oder angestellt (Angestellte: je Stufe 5 Punkte tiefer). */
export async function setAnstellung(formData: FormData): Promise<Result> {
  const { supabase, staff } = await staffClient();
  if (!supabase || staff?.role !== "admin") return { error: "Nur Partner." };
  const name = String(formData.get("berater") ?? "");
  const anstellung = formData.get("anstellung") === "angestellt" ? "angestellt" : "freelancer";
  const { error } = await supabase.from("berater").update({ anstellung }).eq("name", name);
  if (error) return { error: /anstellung/.test(error.message) ? "Bitte zuerst in Supabase das SQL «Karriere» ausführen." : error.message };
  revalidatePath("/admin/karriere");
  return { error: null };
}
