"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
  const tourUrl = String(formData.get("tour_url") || "").trim();
  const beraterRaw = String(formData.get("berater") || "").trim();
  const postedPortals = formData.getAll("posted_portals").map(String).filter(Boolean);

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
    tour_url: tourUrl || null,
    berater: beraterRaw || null,
    posted_portals: postedPortals,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
  });

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin", "layout");
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
  const tourUrl = String(formData.get("tour_url") || "").trim();
  const beraterRaw = String(formData.get("berater") || "").trim();
  const postedPortals = formData.getAll("posted_portals").map(String).filter(Boolean);

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
      tour_url: tourUrl || null,
      berater: beraterRaw || null,
      posted_portals: postedPortals,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    })
    .eq("id", listingId);

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin", "layout");
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
    .select("title, address, city, price_chf, status, activated_at")
    .eq("id", listingId)
    .single();

  const updatePayload: Record<string, unknown> = { status };
  if (before && before.status !== "active" && status === "active" && !before.activated_at) {
    updatePayload.activated_at = new Date().toISOString();
  }

  const { error } = await supabase.from("listings").update(updatePayload).eq("id", listingId);
  if (error) return { error: error.message };

  // Bei Erstaktivierung: Newsletter-Abonnenten über das neue Objekt informieren.
  if (before && before.status !== "active" && status === "active") {
    await notifyNewsletterSubscribers(supabase, listingId, before);
  }

  revalidatePath("/admin", "layout");
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

  revalidatePath("/admin", "layout");
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

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function updateLeadFollowUp(leadId: string, followUpAt: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("leads")
    .update({ follow_up_at: followUpAt || null })
    .eq("id", leadId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

const VALID_ACTIVITY_TYPES = ["email", "anruf", "besuch", "notiz"] as const;

export async function addLeadActivity(leadId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const text = String(formData.get("text") || "").trim();
  const typeRaw = String(formData.get("type") || "notiz");
  if (!text) return { error: "Text darf nicht leer sein." };

  const type = (VALID_ACTIVITY_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "notiz";

  const { error } = await supabase.from("lead_activity").insert({ lead_id: leadId, type, text });
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function deleteLeadActivity(activityId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("lead_activity").delete().eq("id", activityId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
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

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function unassignListingOwner(listingId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("listings").update({ owner_id: null }).eq("id", listingId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function deleteListing(listingId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("listings").delete().eq("id", listingId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/immobilien");
  return { error: null };
}

export async function updateCustomerDetails(customerId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const fullName = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const birthdate = String(formData.get("birthdate") || "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      phone: phone || null,
      birthdate: birthdate || null,
    })
    .eq("id", customerId);

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin", "layout");
  return { error: null };
}

const VALID_LEAD_TYPES = ["contact", "valuation", "access_request"] as const;

export async function createLeadManually(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const typeRaw = String(formData.get("type") || "contact");
  const listingId = String(formData.get("listing_id") || "").trim();
  const source = String(formData.get("source") || "").trim();

  if (!name || !email) return { error: "Name und E-Mail sind Pflichtfelder." };

  const type = (VALID_LEAD_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "contact";

  const { error } = await supabase.from("leads").insert({
    type,
    name,
    email,
    phone: phone || null,
    message: message || null,
    listing_id: listingId || null,
    source: source || null,
  });

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function createBerater(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name erforderlich." };

  const { error } = await supabase.from("berater").insert({ name });
  if (error) return { error: error.message.includes("duplicate") ? "Dieser Name existiert bereits." : error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function deleteBerater(id: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("berater").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseClient(url, serviceKey);
}

/**
 * Legt eine neue Kundenakte an (ohne Portal-Login - der kommt erst über
 * invitePortalAccess dazu, falls gewünscht). Ersetzt "Lead erfassen":
 * jeder manuell erfasste Kontakt landet direkt im Kundenstamm.
 */
export async function createCustomer(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const ziel = String(formData.get("ziel") || "").trim();
  const berater = String(formData.get("berater") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!fullName) return { error: "Name ist Pflichtfeld." };

  const { error } = await supabase.from("customers").insert({
    full_name: fullName,
    email: email || null,
    phone: phone || null,
    address: address || null,
    ziel: ziel || null,
    berater: berater || null,
    notes: notes || null,
  });

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const language = String(formData.get("language") || "Deutsch").trim();
  const ziel = String(formData.get("ziel") || "").trim();
  const berater = String(formData.get("berater") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!fullName) return { error: "Name ist Pflichtfeld." };

  const { error } = await supabase
    .from("customers")
    .update({
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      address: address || null,
      language: language || "Deutsch",
      ziel: ziel || null,
      berater: berater || null,
      notes: notes || null,
    })
    .eq("id", customerId);

  if (error) return { error: `Speichern fehlgeschlagen: ${error.message}` };

  revalidatePath("/admin", "layout");
  return { error: null };
}

const VALID_CUSTOMER_TYPES = ["neukunde", "bestand", "ex"] as const;

export async function setCustomerTyp(customerId: string, typ: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  if (!(VALID_CUSTOMER_TYPES as readonly string[]).includes(typ)) {
    return { error: "Ungültiger Typ." };
  }

  const { error } = await supabase.from("customers").update({ typ }).eq("id", customerId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function updateCustomerFollowUp(customerId: string, followUpAt: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase
    .from("customers")
    .update({ follow_up_at: followUpAt || null })
    .eq("id", customerId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function deleteCustomer(customerId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("customers").delete().eq("id", customerId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function addCustomerActivity(customerId: string, formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const text = String(formData.get("text") || "").trim();
  const typeRaw = String(formData.get("type") || "notiz");
  if (!text) return { error: "Text darf nicht leer sein." };

  const type = (VALID_ACTIVITY_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "notiz";

  const { error } = await supabase.from("customer_activity").insert({ customer_id: customerId, type, text });
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function deleteCustomerActivity(activityId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("customer_activity").delete().eq("id", activityId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

/**
 * Verknüpft/löst ein Inserat mit der Kundenakte. Hat der Kunde bereits
 * einen Portal-Login, wird listings.owner_id gleich mitgesetzt, damit
 * das Verkaufs-Cockpit (/dashboard) weiterhin funktioniert - das läuft
 * weiterhin über owner_id, customers.listing_id ist die admin-seitige
 * Sicht darauf.
 */
export async function assignCustomerListing(customerId: string, listingId: string | null) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("portal_user_id, listing_id")
    .eq("id", customerId)
    .single();
  if (fetchError) return { error: fetchError.message };

  const { error } = await supabase.from("customers").update({ listing_id: listingId }).eq("id", customerId);
  if (error) return { error: error.message };

  if (customer?.portal_user_id) {
    const previousListingId = customer.listing_id as string | null;
    if (previousListingId && previousListingId !== listingId) {
      await supabase.from("listings").update({ owner_id: null }).eq("id", previousListingId);
    }
    if (listingId) {
      await supabase.from("listings").update({ owner_id: customer.portal_user_id }).eq("id", listingId);
    }
  }

  revalidatePath("/admin", "layout");
  return { error: null };
}

/**
 * Lädt eine bestehende Kundenakte zum Portal-Login ein (Supabase-Einladung
 * per E-Mail) und verknüpft die neue Auth-User-ID zurück mit der Akte.
 * Braucht SUPABASE_SERVICE_ROLE_KEY - ohne den Key meldet die Funktion
 * sauber einen Fehler statt zu crashen.
 */
export async function invitePortalAccess(customerId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("full_name, email, listing_id")
    .eq("id", customerId)
    .single();
  if (fetchError || !customer) return { error: fetchError?.message || "Kunde nicht gefunden." };
  if (!customer.email) return { error: "Diese Kundenakte hat keine E-Mail-Adresse hinterlegt." };

  const adminClient = getServiceRoleClient();
  if (!adminClient) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt - Einladungen sind serverseitig noch nicht eingerichtet." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://novidom-immo.ch";
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(customer.email, {
    data: { full_name: customer.full_name },
    redirectTo: `${siteUrl}/reset-password`,
  });
  if (error) return { error: error.message };

  const newUserId = data.user?.id;
  if (newUserId) {
    await supabase.from("customers").update({ portal_user_id: newUserId }).eq("id", customerId);
    if (customer.listing_id) {
      await supabase.from("listings").update({ owner_id: newUserId }).eq("id", customer.listing_id);
    }
  }

  revalidatePath("/admin", "layout");
  return { error: null };
}

/**
 * Für Gregy/Ruedi: legt einen Admin-Login an (nicht im Kundenstamm,
 * separate Einladung mit role=admin). Braucht SUPABASE_SERVICE_ROLE_KEY.
 */
export async function inviteAdmin(formData: FormData) {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError, success: false };

  const email = String(formData.get("email") || "").trim();
  const fullName = String(formData.get("full_name") || "").trim();
  if (!email) return { error: "E-Mail-Adresse erforderlich.", success: false };

  const adminClient = getServiceRoleClient();
  if (!adminClient) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt - Einladungen sind serverseitig noch nicht eingerichtet.", success: false };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://novidom-immo.ch";
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: fullName ? { full_name: fullName } : undefined,
    redirectTo: `${siteUrl}/reset-password`,
  });
  if (error) return { error: error.message, success: false };

  const newUserId = data.user?.id;
  if (newUserId) {
    await adminClient.from("profiles").update({ role: "admin" }).eq("id", newUserId);
  }

  revalidatePath("/admin", "layout");
  return { error: null, success: true };
}

type ImportRow = { name: string; email: string; phone: string; message: string };

export async function bulkImportCustomers(rows: ImportRow[]) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError, count: 0 };

  const payload = rows
    .filter((r) => r.name.trim())
    .map((r) => ({
      full_name: r.name.trim(),
      email: r.email.trim() || null,
      phone: r.phone.trim() || null,
      notes: r.message.trim() || null,
      typ: "bestand" as const,
    }));

  if (payload.length === 0) return { error: "Keine gültigen Zeilen (Name ist Pflicht).", count: 0 };

  const { error } = await supabase.from("customers").insert(payload);
  if (error) return { error: error.message, count: 0 };

  revalidatePath("/admin", "layout");
  return { error: null, count: payload.length };
}

/**
 * Schickt dem Kunden den Exposé-Link des verknüpften Inserats per E-Mail -
 * Ersatz für "Bankdossier senden" aus der Vorlage, angepasst auf unseren
 * Verkaufsfall. Braucht RESEND_API_KEY, meldet sonst sauber einen Fehler.
 */
export async function sendExposeEmail(customerId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("full_name, email, listing_id, listings(address, city, title)")
    .eq("id", customerId)
    .single();
  if (fetchError || !customer) return { error: fetchError?.message || "Kunde nicht gefunden." };
  if (!customer.email) return { error: "Diese Kundenakte hat keine E-Mail-Adresse hinterlegt." };
  if (!customer.listing_id) return { error: "Keine Immobilie verknüpft." };

  const resend = createResendClient();
  if (!resend) return { error: "RESEND_API_KEY ist nicht gesetzt - E-Mail-Versand ist noch nicht eingerichtet." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://novidom-immo.ch";
  const from = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";
  const listing = customer.listings as unknown as { address: string; city: string; title: string | null } | null;
  const name = listing?.title || `${listing?.address ?? ""}, ${listing?.city ?? ""}`;
  const url = `${siteUrl}/immobilien/${customer.listing_id}/expose`;
  const firstName = customer.full_name.split(" ")[0];

  const { error } = await resend.emails.send({
    from,
    to: customer.email,
    subject: `Ihr Exposé — ${name}`,
    text: `Hallo ${firstName}\n\nHier ist der Link zu Ihrem Exposé:\n\n${url}\n\nFreundliche Grüsse\nIhr Team von NoviDom Immo`,
  });
  if (error) return { error: error.message };

  await supabase.from("customer_activity").insert({ customer_id: customerId, type: "email", text: "Exposé per E-Mail verschickt" });

  revalidatePath("/admin", "layout");
  return { error: null };
}

const REQUIRED_DOCUMENTS = [
  "Grundbuchauszug",
  "Grundrisspläne",
  "Gebäudeversicherungsausweis (GVB/GVZ)",
  "Energieausweis (GEAK), falls vorhanden",
  "Ausweiskopie",
];

/**
 * Warme Wiedervorlage-Mail an einen Bestandskunden, der länger nichts
 * mehr gehört hat - Gegenstück zur kalten Akquise-E-Mail.
 */
export async function sendFollowUpEmail(customerId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("full_name, email, berater")
    .eq("id", customerId)
    .single();
  if (fetchError || !customer) return { error: fetchError?.message || "Kunde nicht gefunden." };
  if (!customer.email) return { error: "Diese Kundenakte hat keine E-Mail-Adresse hinterlegt." };

  const resend = createResendClient();
  if (!resend) return { error: "RESEND_API_KEY ist nicht gesetzt - E-Mail-Versand ist noch nicht eingerichtet." };

  const from = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";
  const firstName = customer.full_name.split(" ")[0];
  const berater = customer.berater || "Ihr Team von NoviDom Immo";

  const { error } = await resend.emails.send({
    from,
    to: customer.email,
    subject: "Kurzes Update zu Ihrem Anliegen",
    text: `Hallo ${firstName}\n\nWir wollten kurz nachfragen, ob sich bei Ihnen in der Zwischenzeit etwas getan hat oder ob noch Fragen offen sind. Gerne melden wir uns auch telefonisch, wenn Ihnen das lieber ist.\n\nFreundliche Grüsse\n${berater}\nNoviDom Immo`,
  });
  if (error) return { error: error.message };

  await supabase.from("customer_activity").insert({ customer_id: customerId, type: "email", text: "Nachfass-Mail verschickt" });

  revalidatePath("/admin", "layout");
  return { error: null };
}

/**
 * Fordert die üblichen Verkaufsunterlagen per E-Mail an.
 */
export async function sendDocumentRequestEmail(customerId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("full_name, email, berater")
    .eq("id", customerId)
    .single();
  if (fetchError || !customer) return { error: fetchError?.message || "Kunde nicht gefunden." };
  if (!customer.email) return { error: "Diese Kundenakte hat keine E-Mail-Adresse hinterlegt." };

  const resend = createResendClient();
  if (!resend) return { error: "RESEND_API_KEY ist nicht gesetzt - E-Mail-Versand ist noch nicht eingerichtet." };

  const from = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";
  const firstName = customer.full_name.split(" ")[0];
  const berater = customer.berater || "Ihr Team von NoviDom Immo";
  const docList = REQUIRED_DOCUMENTS.map((d) => `• ${d}`).join("\n");

  const { error } = await resend.emails.send({
    from,
    to: customer.email,
    subject: "Unterlagen für den Verkauf",
    text: `Hallo ${firstName}\n\nDamit wir mit dem Verkauf weiterkommen, benötigen wir noch folgende Unterlagen von Ihnen:\n\n${docList}\n\nSie können uns diese einfach per E-Mail zurücksenden. Vielen Dank!\n\nFreundliche Grüsse\n${berater}\nNoviDom Immo`,
  });
  if (error) return { error: error.message };

  await supabase.from("customer_activity").insert({ customer_id: customerId, type: "email", text: "Unterlagen angefordert" });

  revalidatePath("/admin", "layout");
  return { error: null };
}

const VALID_TERMIN_TYPES = ["erstgespraech", "besichtigung", "notartermin", "sonstiges"] as const;

export async function createTermin(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const title = String(formData.get("title") || "").trim();
  const typeRaw = String(formData.get("type") || "besichtigung");
  const date = String(formData.get("date") || "").trim();
  const time = String(formData.get("time") || "09:00").trim();
  const customerId = String(formData.get("customer_id") || "").trim();
  const berater = String(formData.get("berater") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!title || !date) return { error: "Titel und Datum sind Pflichtfelder." };

  const type = (VALID_TERMIN_TYPES as readonly string[]).includes(typeRaw) ? typeRaw : "besichtigung";
  const startsAt = new Date(`${date}T${time || "09:00"}:00`);
  if (Number.isNaN(startsAt.getTime())) return { error: "Ungültiges Datum/Zeit." };

  const { error } = await supabase.from("termine").insert({
    title,
    type,
    starts_at: startsAt.toISOString(),
    customer_id: customerId || null,
    berater: berater || null,
    notes: notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function deleteTermin(terminId: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (!supabase) return { error: authError };

  const { error } = await supabase.from("termine").delete().eq("id", terminId);
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return { error: null };
}
