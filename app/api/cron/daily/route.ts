import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";
import { sendBuyerAlerts } from "@/lib/buyerAlert";
import { GET as weeklyReport } from "@/app/api/cron/weekly-report/route";
import { GET as monitor } from "@/app/api/cron/monitor/route";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

type Row = Record<string, unknown>;


/**
 * Täglich früh am Morgen (Vercel Cron, siehe vercel.json):
 * 1. Käufer-Alarm für neue Objekte (mit Foto), an alle passenden Suchprofile
 * 2. Feedback-Link per Mail an Kunden, die gestern besichtigt haben
 * 2b. Zwei Tage nach einer Exposé-Anfrage: Besichtigung anbieten
 * (Die Tagesübersicht fürs Team verschickt neu /api/cron/morning um 7:30.)
 * Montags läuft zusätzlich der Wochenbericht an Eigentümer, dienstags
 * Wertmonitor und Hypothekenwächter (früher eigene Crons).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resend = createResendClient();
  if (!url || !key || !resend) return NextResponse.json({ skipped: true, grund: "Service-Role-Key oder Resend fehlt." });
  const admin = createSupabaseClient(url, key);

  const now = new Date();
  const result: Record<string, unknown> = {};

  // 1. Käufer-Alarm für neue Objekte der letzten 7 Tage
  const { data: fresh } = await admin
    .from("listings")
    .select("id, created_at, activated_at, status, listing_photos(count)")
    .in("status", ["active", "reserved"]);
  let alarmSent = 0;
  for (const l of (fresh ?? []) as Row[]) {
    const since = new Date((l.activated_at as string | null) ?? (l.created_at as string)).getTime();
    const photos = (l.listing_photos as { count: number }[] | null)?.[0]?.count ?? 0;
    if (now.getTime() - since > 7 * DAY || photos === 0) continue;
    const res = await sendBuyerAlerts(admin, l.id as string);
    alarmSent += res.sent;
  }
  result.kaeuferAlarm = alarmSent;

  // 2. Feedback nach Besichtigungen (gestern bis vor 2 Stunden)
  let feedbackSent = 0;
  const { data: viewings, error: viewError } = await admin
    .from("termine")
    .select("id, starts_at, listing_id, customer_id, feedback_sent_at, customers(full_name, email), listings(title, address, city)")
    .eq("type", "besichtigung")
    .is("feedback_sent_at", null)
    .gte("starts_at", new Date(now.getTime() - 30 * HOUR).toISOString())
    .lte("starts_at", new Date(now.getTime() - 2 * HOUR).toISOString());
  if (!viewError) {
    for (const v of (viewings ?? []) as Row[]) {
      const customer = v.customers as { full_name: string | null; email: string | null } | null;
      const listing = v.listings as { title: string | null; address: string; city: string } | null;
      if (!customer?.email || !v.listing_id || !listing) continue;
      const title = listing.title || `${listing.address}, ${listing.city}`;
      const first = (customer.full_name || "").split(" ")[0] || "Guten Tag";
      const { error } = await resend.emails.send({
        from: FROM,
        to: customer.email,
        subject: `Wie hat Ihnen «${title}» gefallen?`,
        text: [
          `Hallo ${first}`,
          "",
          `Danke für Ihren Besuch bei «${title}». Wie hat es Ihnen gefallen? Eine Minute, ganz ohne Anruf:`,
          `${SITE}/feedback/${v.listing_id}?k=mail`,
          "",
          "Ihre Antworten helfen dem Verkäufer und uns. Haben Sie Fragen oder möchten Sie ein Angebot machen? Antworten Sie einfach auf diese Mail.",
          "",
          "Freundliche Grüsse",
          "NoviDom Immobilien AG",
        ].join("\n"),
      });
      if (error) continue;
      feedbackSent++;
      await admin.from("termine").update({ feedback_sent_at: now.toISOString() }).eq("id", v.id);
      if (v.customer_id) {
        await admin.from("customer_activity").insert({ customer_id: v.customer_id, type: "email", text: `Feedback-Link nach Besichtigung: ${title}` });
      }
    }
  }
  result.feedback = viewError ? "SQL «Nachfassen» fehlt noch" : feedbackSent;

  // 2b. Zwei Tage nach einer Exposé-Anfrage: Besichtigung anbieten (einmal)
  let exposeFollowups = 0;
  const { data: exposeLeads } = await admin
    .from("leads")
    .select("id, name, email, listing_id, status, archived_at, created_at, listings(title, address, city, status)")
    .eq("source", "expose")
    .gte("created_at", new Date(now.getTime() - 72 * HOUR).toISOString())
    .lte("created_at", new Date(now.getTime() - 48 * HOUR).toISOString());
  for (const l of (exposeLeads ?? []) as Row[]) {
    const listing = l.listings as { title: string | null; address: string; city: string; status: string } | null;
    if (!l.email || !listing || l.archived_at || l.status === "abgeschlossen" || l.status === "irrelevant") continue;
    if (listing.status !== "active" && listing.status !== "reserved") continue;
    const [{ data: done }, { data: viewing }] = await Promise.all([
      admin.from("lead_activity").select("id").eq("lead_id", l.id).ilike("text", "Nachfass-Mail nach Exposé%").limit(1),
      admin.from("leads").select("id").eq("listing_id", l.listing_id).ilike("email", l.email as string).eq("source", "besichtigung").limit(1),
    ]);
    if (done?.length || viewing?.length) continue;
    const title = listing.title || `${listing.address}, ${listing.city}`;
    const first = ((l.name as string) || "").split(" ")[0] || "Guten Tag";
    const { error } = await resend.emails.send({
      from: FROM,
      to: l.email as string,
      subject: `Möchten Sie «${title}» besichtigen?`,
      text: [
        `Hallo ${first}`,
        "",
        `Vor zwei Tagen haben Sie das Exposé zu «${title}» angefordert. Hat es Ihnen gefallen?`,
        "",
        "Wenn Sie das Objekt gerne sehen möchten, geben Sie einfach drei Wunschtermine an. Wir klären es mit der Eigentümerschaft und bestätigen Ihnen den Termin:",
        `${SITE}/immobilien/${l.listing_id}#anfragen`,
        "",
        "Fragen zur Finanzierung? Antworten Sie auf diese Mail, wir prüfen sie kostenlos.",
        "",
        "Freundliche Grüsse",
        "NoviDom Immobilien AG",
      ].join("\n"),
    });
    if (error) continue;
    exposeFollowups++;
    await admin.from("lead_activity").insert({ lead_id: l.id, type: "email", text: `Nachfass-Mail nach Exposé verschickt: ${title}` });
  }
  result.exposeNachfassen = exposeFollowups;

  // Die Tagesübersicht ans Team kommt neu um 7:30 Uhr (siehe /api/cron/morning)
  const weekday = now.toLocaleString("en-US", { timeZone: "Europe/Zurich", weekday: "short" }); // Mon, Tue, …

  // 4. Wöchentliche Abläufe (bisher eigene Crons)
  if (weekday === "Mon") result.wochenbericht = (await (await weeklyReport(request)).json().catch(() => null)) ?? true;
  if (weekday === "Tue") result.monitor = (await (await monitor(request)).json().catch(() => null)) ?? true;

  return NextResponse.json({ ok: true, ...result });
}
