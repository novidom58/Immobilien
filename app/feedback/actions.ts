"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const PREIS = ["zu_tief", "passt", "zu_hoch"];
const INTERESSE = ["ja", "vielleicht", "nein"];
const KANAL = ["whatsapp", "instagram", "qr", "mail", "link"];

/**
 * Speichert das Feedback nach einer Besichtigung. Ohne Login, deshalb nur
 * kurze, geprüfte Felder und ein unsichtbares Honeypot-Feld gegen Bots.
 * Mit Service-Role-Key erscheint das Feedback zusätzlich in der
 * Aktivitätsliste des Verkäufers.
 */
export async function submitFeedback(listingId: string, formData: FormData) {
  if (!/^[0-9a-f-]{36}$/i.test(listingId)) return { error: "Ungültiges Objekt." };
  if (String(formData.get("website") || "")) return { error: null };

  const text = (key: string, max: number) => String(formData.get(key) || "").trim().slice(0, max) || null;
  const pick = (key: string, allowed: string[]) => {
    const v = String(formData.get(key) || "");
    return allowed.includes(v) ? v : null;
  };
  const ratingRaw = Number(formData.get("rating"));
  const row = {
    listing_id: listingId,
    name: text("name", 80),
    rating: Number.isInteger(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : null,
    preis: pick("preis", PREIS),
    interesse: pick("interesse", INTERESSE),
    positiv: text("positiv", 600),
    negativ: text("negativ", 600),
    kanal: pick("kanal", KANAL) ?? "link",
  };
  if (!row.rating && !row.preis && !row.interesse && !row.positiv && !row.negativ) {
    return { error: "Bitte mindestens eine Frage beantworten." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const admin = createSupabaseClient(url, key);
    const { error } = await admin.from("viewing_feedback").insert(row);
    if (error) return { error: "Speichern hat nicht geklappt. Bitte später nochmals versuchen." };
    const parts = [row.rating ? `${row.rating}/5 Sterne` : null, row.interesse ? `Interesse: ${row.interesse}` : null].filter(Boolean);
    await admin.from("listing_activity").insert({ listing_id: listingId, text: `Neues Besichtigungsfeedback${parts.length ? ` (${parts.join(", ")})` : ""}` });
    return { error: null };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Nicht eingerichtet." };
  const { error } = await supabase.from("viewing_feedback").insert(row);
  return { error: error ? "Speichern hat nicht geklappt. Bitte später nochmals versuchen." : null };
}
