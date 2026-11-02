import type { SupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";
import { matchesPlan } from "@/lib/planMatching";
import { OFFMARKET_HOURS } from "@/lib/offmarket";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
const FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";

/**
 * Käufer-Alarm: schickt allen vorgemerkten Käufern mit passendem Suchprofil
 * eine Mail zu einem Inserat. Wer schon benachrichtigt wurde (listing_alerts),
 * bekommt keine zweite Mail. Wird vom Knopf am Inserat und vom täglichen
 * Cron für neue Objekte genutzt.
 */
export async function sendBuyerAlerts(supabase: SupabaseClient, listingId: string, dryRun = false) {
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, address, city, price_chf, rooms, living_area, property_type, status, offmarket_until")
    .eq("id", listingId)
    .single();
  if (!listing) return { error: "Inserat nicht gefunden.", matches: 0, sent: 0 };
  const exclusive = listing.offmarket_until && new Date(listing.offmarket_until).getTime() > Date.now();
  if (listing.status !== "active" && listing.status !== "reserved") {
    return { error: "Nur aktive Inserate können gemeldet werden.", matches: 0, sent: 0 };
  }

  const [{ data: buyers }, { data: alreadySent }] = await Promise.all([
    supabase
      .from("customers")
      .select("id, full_name, email, wunsch_ort, objekt_typ, zimmer_min, budget_max")
      .eq("ziel", "kaufen")
      .eq("alarm_opt_in", true)
      .neq("typ", "ex")
      .not("email", "is", null),
    supabase.from("listing_alerts").select("customer_id").eq("listing_id", listingId),
  ]);
  const done = new Set((alreadySent ?? []).map((a) => a.customer_id));
  const targets = (buyers ?? []).filter(
    (b) =>
      !done.has(b.id) &&
      matchesPlan(b, { city: listing.city, property_type: listing.property_type, rooms: listing.rooms, price_chf: listing.price_chf })
  );
  if (dryRun || targets.length === 0) return { error: null, matches: targets.length, sent: 0 };

  const resend = createResendClient();
  if (!resend) return { error: "RESEND_API_KEY ist nicht gesetzt - E-Mail-Versand ist noch nicht eingerichtet.", matches: targets.length, sent: 0 };

  const name = listing.title || `${listing.address}, ${listing.city}`;
  const price = listing.price_chf ? `CHF ${listing.price_chf.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}` : "Preis auf Anfrage";
  const facts = [listing.rooms ? `${listing.rooms} Zimmer` : null, listing.living_area ? `${listing.living_area} m²` : null, price]
    .filter(Boolean)
    .join(" · ");

  let sent = 0;
  for (const buyer of targets) {
    const firstName = (buyer.full_name || "").split(" ")[0] || "Guten Tag";
    const { error: sendError } = await resend.emails.send({
      from: FROM,
      to: buyer.email as string,
      subject: exclusive ? `Exklusiv vorab für Sie: ${name}` : `Neu für Sie: ${name}`,
      text: [
        `Hallo ${firstName}`,
        "",
        `Ein neues Objekt passt zu Ihrem Suchprofil: ${name}, ${listing.city}`,
        facts,
        "",
        exclusive
          ? `Off-Market: Sie sehen dieses Objekt ${OFFMARKET_HOURS} Stunden vor allen anderen. Melden Sie sich im Kundenportal an, um alle Details zu sehen und eine Besichtigung anzufragen.\n`
          : null,
        `Objekt ansehen: ${SITE}/immobilien/${listing.id}`,
        listing.price_chf ? `Finanzierung gleich prüfen: ${SITE}/dashboard?preis=${listing.price_chf}#finanzierung` : "",
        "",
        "Möchten Sie keine Käufer-Alarme mehr? Im Kundenportal unter «Suchprofil» abmelden oder kurz antworten.",
        "",
        "Freundliche Grüsse",
        "NoviDom Immobilien AG",
      ]
        .filter((line) => line !== null)
        .join("\n"),
    });
    if (sendError) continue;
    sent++;
    await supabase.from("listing_alerts").insert({ listing_id: listing.id, customer_id: buyer.id });
    await supabase.from("customer_activity").insert({ customer_id: buyer.id, type: "email", text: `Käufer-Alarm: ${name}` });
  }

  return { error: sent < targets.length ? `${targets.length - sent} Mail(s) konnten nicht verschickt werden.` : null, matches: targets.length, sent };
}
