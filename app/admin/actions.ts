"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";
import { createResendClient } from "@/lib/resend";

const VALID_STATUS = ["active", "reserved", "sold", "draft"] as const;
const VALID_TYPES = ["Haus", "Wohnung", "Stockwerkeigentum", "Rendite", "Andere"] as const;

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase ist nicht eingerichtet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Nicht angemeldet." };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) return { supabase: null, error: `Profil nicht lesbar: ${profileError.message}` };
  if (profile?.role !== "admin") return { supabase: null, error: "Keine Admin-Rechte." };

  return { supabase, error: null };
}

export async function createListing(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const postalCode = String(formData.get("postal_code") || "").trim();
  const priceRaw = String(formData.get("price_chf") || "").replace(/[^\d]/g, "");
  const title = String(formData.get("title") || "").trim();
  const typeRaw = String(formData.get("property_type") || "Haus");
  const roomsRaw = String(formData.get("rooms") || "").trim().replace(",", ".");
  const areaRaw = String(formData.get("living_area") || "").replace(/[^\d]/g, "");
  const description = String(formData.get("description") || "").trim();

  if (!address || !city) return { error: "Adresse und Ort sind Pflichtfelder." };

  const propertyType = (VALID_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "Haus";

  // Best-effort: Pin für die Karte automatisch setzen; schlägt das fehl,
  // wird das Inserat trotzdem gespeichert.
  const coords = await geocodeAddress(address, city);

  const { error } = await supabase.from("listings").insert({
    address,
    city,
    postal_code: postalCode || null,
    price_chf: priceRaw ? Number(priceRaw) : null,
    title: title || null,
    property_type: propertyType,
    rooms: roomsRaw ? Number(roomsRaw) : null,
    living_area: areaRaw ? Number(areaRaw) : null,
    description: description || null,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  });

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/immobilien");
  return { error: null };
}

export async function updateListing(listingId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const postalCode = String(formData.get("postal_code") || "").trim();
  const priceRaw = String(formData.get("price_chf") || "").replace(/[^\d]/g, "");
  const title = String(formData.get("title") || "").trim();
  const typeRaw = String(formData.get("property_type") || "Haus");
  const roomsRaw = String(formData.get("rooms") || "").trim().replace(",", ".");
  const areaRaw = String(formData.get("living_area") || "").replace(/[^\d]/g, "");
  const description = String(formData.get("description") || "").trim();

  if (!address || !city) return { error: "Adresse und Ort sind Pflichtfelder." };

  const propertyType = (VALID_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "Haus";

  // Bei Adress-/Ortsänderung erneut geocodieren, damit der Karten-Pin stimmt.
  const coords = await geocodeAddress(address, city);

  const { error } = await supabase
    .from("listings")
    .update({
      address,
      city,
      postal_code: postalCode || null,
      price_chf: priceRaw ? Number(priceRaw) : null,
      title: title || null,
      property_type: propertyType,
      rooms: roomsRaw ? Number(roomsRaw) : null,
      living_area: areaRaw ? Number(areaRaw) : null,
      description: description || null,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    })
    .eq("id", listingId);

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/immobilien");
  revalidatePath(`/immobilien/${listingId}`);
  return { error: null };
}

export async function updateListingStatus(listingId: string, status: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  if (!(VALID_STATUS as readonly string[]).includes(status)) {
    return { error: "Ungültiger Status." };
  }

  const { data: before } = await supabase
    .from("listings")
    .select("title, address, city, price_chf, status")
    .eq("id", listingId)
    .single();

  const { error } = await supabase.from("listings").update({ status }).eq("id", listingId);
  if (error) return { error: error.message };

  // Bei Erstaktivierung: Newsletter-Abonnenten über das neue Objekt informieren.
  if (before && before.status !== "active" && status === "active") {
    await notifyNewsletterSubscribers(supabase, listingId, before);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/immobilien");
  return { error: null };
}

async function notifyNewsletterSubscribers(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  listingId: string,
  listing: { title: string | null; address: string; city: string; price_chf: number | null }
) {
  const resend = createResendClient();
  if (!resend) return;

  const { data: subscribers } = await supabase.from("newsletter_subscribers").select("email").limit(1000);
  if (!subscribers || subscribers.length === 0) return;

  const name = listing.title || `${listing.address}, ${listing.city}`;
  const price = listing.price_chf
    ? `CHF ${listing.price_chf.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`
    : "Preis auf Anfrage";
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://novidom-immo.ch"}/immobilien/${listingId}`;
  const from = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";

  await Promise.allSettled(
    subscribers.map((s) =>
      resend.emails.send({
        from,
        to: s.email,
        subject: `Neu bei NoviDom: ${name}`,
        text: `Hallo\n\nEin neues Objekt ist bei NoviDom Immo online:\n\n${name}\n${price}\n\nAnsehen: ${url}\n\nFreundliche Grüsse\nNoviDom Immo`,
      })
    )
  );
}

const VALID_LEAD_STATUS = ["neu", "kontaktiert", "termin", "abgeschlossen", "irrelevant"] as const;

export async function updateLeadStatus(leadId: string, status: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  if (!(VALID_LEAD_STATUS as readonly string[]).includes(status)) {
    return { error: "Ungültiger Status." };
  }

  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

export async function updateLeadNote(leadId: string, note: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("leads")
    .update({ admin_note: note.trim() || null })
    .eq("id", leadId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

export async function assignListingOwner(listingId: string, email: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const trimmedEmail = email.trim();
  if (!trimmedEmail) return { error: "E-Mail-Adresse erforderlich." };

  const { error } = await supabase.rpc("admin_assign_listing_owner", {
    p_listing_id: listingId,
    p_customer_email: trimmedEmail,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

export async function unassignListingOwner(listingId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("listings").update({ owner_id: null }).eq("id", listingId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}

export async function deleteListing(listingId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/immobilien");
  return { error: null };
}
