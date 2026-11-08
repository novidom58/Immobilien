import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";
import { createResendClient } from "@/lib/resend";
import { syncLeadToCrm } from "@/lib/leadCrm";

const FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Exposé anfordern: Interessent gibt Vorname, Nachname und E-Mail an. Er
 * bekommt den Link per Mail, im CRM entsteht ein Lead (Quelle «expose»).
 * Zwei Tage später fragt der tägliche Cron nach, ob eine Besichtigung
 * gewünscht ist.
 */
export async function POST(request: Request) {
  const limited = rateLimit(request, "expose", 6);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const str = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const firstName = str(body.first_name, 80);
  const lastName = str(body.last_name, 80);
  const email = str(body.email, 200);
  const phone = str(body.phone, 50);
  const listingId = str(body.listingId, 40);
  if (!firstName || !lastName || !EMAIL_RE.test(email) || !UUID_RE.test(listingId)) {
    return NextResponse.json({ error: "Bitte Vorname, Nachname und eine gültige E-Mail-Adresse angeben." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Gerade nicht verfügbar." }, { status: 503 });
  const admin = createSupabaseClient(url, key);

  const { data: listing } = await admin
    .from("listings")
    .select("id, title, address, city, status")
    .eq("id", listingId)
    .in("status", ["active", "reserved"])
    .maybeSingle();
  if (!listing) return NextResponse.json({ error: "Objekt nicht gefunden." }, { status: 404 });

  const title = listing.title || `${listing.address}, ${listing.city}`;
  const name = `${firstName} ${lastName}`;
  const exposeUrl = `${SITE}/immobilien/${listing.id}/expose`;

  await admin.from("leads").insert({
    type: "contact",
    name,
    email,
    phone: phone || null,
    message: `Exposé angefordert: ${title}`,
    listing_id: listing.id,
    source: "expose",
  });
  await syncLeadToCrm({
    type: "contact",
    name,
    email,
    phone: phone || null,
    message: `Exposé angefordert: ${title}`,
    source: "expose",
    listing_id: listing.id,
    wants_financing: false,
    anliegen: "kaufen",
    profile: null,
  }).catch(() => {});

  const resend = createResendClient();
  if (resend) {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Ihr Exposé: ${title}`,
      text: [
        `Guten Tag ${firstName} ${lastName}`,
        "",
        `Vielen Dank für Ihr Interesse an «${title}». Hier ist das Exposé mit allen Fotos, Eckdaten und dem Grundriss:`,
        exposeUrl,
        "",
        `Besichtigung gewünscht? Geben Sie auf der Objektseite drei Wunschtermine an, wir organisieren den Rest: ${SITE}/immobilien/${listing.id}#anfragen`,
        "",
        "Freundliche Grüsse",
        "NoviDom Immobilien AG",
      ].join("\n"),
    });
  }

  return NextResponse.json({ ok: true, url: `/immobilien/${listing.id}/expose` });
}
