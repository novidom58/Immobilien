import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";
import { sendBuyerAlerts } from "@/lib/buyerAlert";
import { GET as weeklyReport } from "@/app/api/cron/weekly-report/route";
import { GET as monitor } from "@/app/api/cron/monitor/route";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";
const TEAM = process.env.LEADS_EMAIL_TO || "verkaufen@novidom-immo.ch";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

type Row = Record<string, unknown>;

const zurich = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleString("de-CH", { timeZone: "Europe/Zurich", ...opts });

/**
 * Täglich früh am Morgen (Vercel Cron, siehe vercel.json):
 * 1. Käufer-Alarm für neue Objekte (mit Foto), an alle passenden Suchprofile
 * 2. Feedback-Link per Mail an Kunden, die gestern besichtigt haben
 * 3. Werktags: Übersicht ans Team, was heute fällig ist
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

  // 3. Werktags: Übersicht ans Team
  const weekday = now.toLocaleString("en-US", { timeZone: "Europe/Zurich", weekday: "short" }); // Mon, Tue, …
  const isWorkday = weekday !== "Sat" && weekday !== "Sun";
  const today = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
  if (isWorkday) {
    const [leadsRes, customersRes, termineRes] = await Promise.all([
      admin.from("leads").select("*").order("created_at", { ascending: true }).limit(2000),
      admin.from("customers").select("id, full_name, berater, follow_up_at, typ").lte("follow_up_at", today).neq("typ", "ex"),
      admin
        .from("termine")
        .select("title, type, starts_at, berater, customers(full_name)")
        .gte("starts_at", new Date(now.getTime() - 12 * HOUR).toISOString())
        .lt("starts_at", new Date(now.getTime() + 36 * HOUR).toISOString())
        .order("starts_at"),
    ]);
    const leads = ((leadsRes.data ?? []) as Row[]).filter((l) => !l.archived_at && l.status !== "abgeschlossen" && l.status !== "irrelevant");
    const age = (l: Row) => (now.getTime() - new Date(l.created_at as string).getTime()) / DAY;
    const who = (r: Row) => (r.berater ? ` [${r.berater}]` : "");

    const bewerbungen = leads.filter((l) => l.source === "bewerbung" && l.status === "neu" && age(l) >= 7);
    const offen = leads.filter((l) => l.source !== "bewerbung" && l.status === "neu" && age(l) >= 3);
    const leadFollow = leads.filter((l) => l.follow_up_at && (l.follow_up_at as string) <= today);
    const customerFollow = (customersRes.data ?? []) as Row[];
    const termine = ((termineRes.data ?? []) as Row[]).filter(
      (t) => new Date(t.starts_at as string).toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" }) === today
    );

    const sections: string[] = [];
    if (termine.length) {
      sections.push(
        `Termine heute (${termine.length})`,
        ...termine.map((t) => `• ${zurich(new Date(t.starts_at as string), { hour: "2-digit", minute: "2-digit" })} ${t.title}${(t.customers as { full_name?: string } | null)?.full_name ? `, ${(t.customers as { full_name: string }).full_name}` : ""}${who(t)}`),
        ""
      );
    }
    if (bewerbungen.length) {
      sections.push(
        `Bewerbungen ohne Antwort seit 7+ Tagen (versprochen: innert 10 Tagen)`,
        ...bewerbungen.map((l) => `• ${l.name}, eingegangen vor ${Math.floor(age(l))} Tagen`),
        ""
      );
    }
    if (offen.length) {
      sections.push(`Neue Leads seit 3+ Tagen ohne Kontakt (${offen.length})`, ...offen.slice(0, 20).map((l) => `• ${l.name} (${l.source || l.type}), ${Math.floor(age(l))} Tage${who(l)}`), "");
    }
    if (leadFollow.length || customerFollow.length) {
      sections.push(
        `Wiedervorlage fällig (${leadFollow.length + customerFollow.length})`,
        ...leadFollow.slice(0, 20).map((l) => `• Lead ${l.name}${who(l)}`),
        ...customerFollow.slice(0, 20).map((c) => `• Kunde ${c.full_name}${who(c)}`),
        ""
      );
    }
    if (sections.length) {
      await resend.emails.send({
        from: FROM,
        to: TEAM,
        subject: `NoviDom heute: ${[termine.length && `${termine.length} Termine`, offen.length && `${offen.length} offene Leads`, bewerbungen.length && `${bewerbungen.length} Bewerbungen`].filter(Boolean).join(", ") || "Wiedervorlagen"}`,
        text: [`Guten Morgen`, "", ...sections, `Alles im CRM: ${SITE}/admin`].join("\n"),
      });
      result.tagesuebersicht = true;
    }
  }

  // 4. Wöchentliche Abläufe (bisher eigene Crons)
  if (weekday === "Mon") result.wochenbericht = (await (await weeklyReport(request)).json().catch(() => null)) ?? true;
  if (weekday === "Tue") result.monitor = (await (await monitor(request)).json().catch(() => null)) ?? true;

  return NextResponse.json({ ok: true, ...result });
}
