import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";

export const dynamic = "force-dynamic";

const REPORT_FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";

/**
 * Wöchentlicher Kundenreport (Montag 08:00 UTC via Vercel Cron, siehe
 * vercel.json). Schickt jedem Kunden mit aktivem Inserat die aktuellen
 * Cockpit-Zahlen per E-Mail. Benötigt SUPABASE_SERVICE_ROLE_KEY (nur
 * serverseitig!), um die E-Mail-Adressen der Eigentümer zu lesen - ohne
 * den Key meldet die Route sauber "skipped".
 */
export async function GET(request: Request) {
  // Vercel setzt bei Cron-Aufrufen automatisch diesen Header, sobald die
  // Env-Variable CRON_SECRET existiert - schützt vor fremden Aufrufen.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resend = createResendClient();

  if (!url || !serviceKey || !resend) {
    return NextResponse.json({
      skipped: true,
      grund: "SUPABASE_SERVICE_ROLE_KEY und/oder RESEND_API_KEY nicht gesetzt.",
    });
  }

  const supabase = createSupabaseClient(url, serviceKey);

  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, address, city, status, views, tour_views, expose_downloads, viewing_requests, owner_id")
    .in("status", ["active", "reserved"])
    .not("owner_id", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  const failures: string[] = [];

  for (const listing of listings ?? []) {
    const { data: userData } = await supabase.auth.admin.getUserById(listing.owner_id);
    const email = userData?.user?.email;
    if (!email) continue;

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: newActivities } = await supabase
      .from("listing_activity")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listing.id)
      .gte("created_at", since);

    const { error: sendError } = await resend.emails.send({
      from: REPORT_FROM,
      to: email,
      subject: `Ihr Wochenbericht — ${listing.address}, ${listing.city}`,
      text: [
        `Guten Morgen`,
        ``,
        `Hier der aktuelle Stand Ihres Verkaufs (${listing.address}, ${listing.city}):`,
        ``,
        `Inseratsaufrufe gesamt: ${listing.views}`,
        `3D-Rundgang-Aufrufe: ${listing.tour_views}`,
        `Exposé-Downloads: ${listing.expose_downloads}`,
        `Besichtigungsanfragen: ${listing.viewing_requests}`,
        `Neue Aktivitäten in den letzten 7 Tagen: ${newActivities ?? 0}`,
        ``,
        `Alle Details finden Sie jederzeit in Ihrem Verkaufs-Cockpit.`,
        ``,
        `Freundliche Grüsse`,
        `Jana Schnuderl · NoviDom Immo`,
      ].join("\n"),
    });

    if (sendError) failures.push(`${listing.id}: ${sendError.message}`);
    else sent += 1;
  }

  return NextResponse.json({ ok: true, gesendet: sent, fehler: failures });
}
