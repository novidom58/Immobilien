"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Nicht eingerichtet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const postalCode = String(formData.get("postal_code") || "").trim();
  const priceRaw = String(formData.get("price_chf") || "").trim();

  if (!address || !city) return { error: "Adresse und Ort sind Pflichtfelder." };

  const { error } = await supabase.from("listings").insert({
    address,
    city,
    postal_code: postalCode || null,
    price_chf: priceRaw ? Number(priceRaw) : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}
