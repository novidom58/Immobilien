"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";

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

  // Best-effort: place the pin on the map automatically. If it fails (no
  // network, address not found), the listing still saves - lat/lng can be
  // set manually later in the Supabase Table Editor.
  const coords = await geocodeAddress(address, city);

  const { error } = await supabase.from("listings").insert({
    address,
    city,
    postal_code: postalCode || null,
    price_chf: priceRaw ? Number(priceRaw) : null,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { error: null };
}
