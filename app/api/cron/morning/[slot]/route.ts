import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";
import { agendaLine, loadAgenda, zDay, zDayLabel, type AgendaItem } from "@/lib/agenda";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";
const TEAM = process.env.LEADS_EMAIL_TO || "verkaufen@novidom-immo.ch";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

type Row = Record<string, unknown>;

/** Stunden, um die Zürich gerade vor UTC liegt (1 im Winter, 2 im Sommer). */
function zurichOffset(now: Date) {
  const local = Number(now.toLocaleString("en-US", { timeZone: "Europe/Zurich", hour: "2-digit", hour12: false })) % 24;
  return (local - now.getUTCHours() + 24) % 24;
}

/**
 * Morgenmail ans Team um 7:30 Uhr Zürcher Zeit. Vercel rechnet in UTC, darum
 * gibt es zwei Crons: «sommer» um 5:30 UTC und «winter» um 6:30 UTC; es läuft
 * nur der, der gerade 7:30 trifft.
 * - Jeden Tag: wer heute wann welche Termine hat (am Wochenende nur, wenn
 *   es Termine gibt), dazu offene Leads, Bewerbungen und Wiedervorlagen
 * - Montags: zusätzlich alle Termine der Woche und die Erinnerung, die
 *   Richtzinsen zu prüfen
 */
export async function GET(request: Request, { params }: { params: Promise<{ slot: string }> }) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slot } = await params;
  const now = new Date();
  const force = new URL(request.url).searchParams.get("force") === "1";
  const offset = zurichOffset(now);
  if (!force && ((slot === "sommer" && offset !== 2) || (slot === "winter" && offset !== 1) || (slot !== "sommer" && slot !== "winter"))) {
    return NextResponse.json({ skipped: true, grund: `Slot ${slot} passt nicht zur aktuellen Zeitzone (UTC+${offset}).` });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resend = createResendClient();
  if (!url || !key || !resend) return NextResponse.json({ skipped: true, grund: "Service-Role-Key oder Resend fehlt." });
  const admin = createSupabaseClient(url, key);

  const weekday = now.toLocaleString("en-US", { timeZone: "Europe/Zurich", weekday: "short" });
  const isMonday = weekday === "Mon";
  const isWorkday = weekday !== "Sat" && weekday !== "Sun";
  const today = zDay(now.toISOString());

  // Zeitraum: heute bzw. ganze Woche (Montag bis Sonntag)
  const from = new Date(now.getTime() - 8 * HOUR);
  const to = new Date(now.getTime() + (isMonday ? 7 : 1) * DAY);
  const agenda = await loadAgenda(admin, from, to);
  const heute = agenda.filter((i) => zDay(i.start) === today);

  const sections: string[] = [];

  // 1. Heute, nach Person
  if (heute.length) {
    const byWho = new Map<string, AgendaItem[]>();
    for (const i of heute) byWho.set(i.who, [...(byWho.get(i.who) ?? []), i]);
    sections.push(`HEUTE, ${zDayLabel(now.toISOString()).toUpperCase()} (${heute.length} ${heute.length === 1 ? "Termin" : "Termine"})`, "");
    for (const [who, items] of byWho) {
      sections.push(`${who}:`, ...items.map((i) => agendaLine(i, false)), "");
    }
  } else if (isWorkday) {
    sections.push("HEUTE: keine Termine eingetragen.", "");
  }

  // 2. Montag: Woche im Überblick und Zins-Erinnerung
  if (isMonday) {
    const rest = agenda.filter((i) => zDay(i.start) > today);
    sections.push(`DIESE WOCHE (${rest.length} weitere ${rest.length === 1 ? "Termin" : "Termine"})`, "");
    if (rest.length) {
      let day = "";
      for (const i of rest) {
        if (zDay(i.start) !== day) {
          day = zDay(i.start);
          sections.push(zDayLabel(i.start));
        }
        sections.push(agendaLine(i));
      }
      sections.push("");
    } else {
      sections.push("Noch keine weiteren Termine eingetragen.", "");
    }

    const { data: zinsen } = await admin.from("zinssaetze").select("updated_at").order("updated_at", { ascending: false }).limit(1);
    const last = (zinsen?.[0] as Row | undefined)?.updated_at as string | undefined;
    const tage = last ? Math.floor((now.getTime() - new Date(last).getTime()) / DAY) : null;
    sections.push(
      "ERINNERUNG: RICHTZINSEN",
      `Bitte die Richtzinsen für diese Woche prüfen und speichern${tage !== null ? ` (zuletzt vor ${tage} ${tage === 1 ? "Tag" : "Tagen"} aktualisiert)` : ""}.`,
      "Bei einer Bewegung ab 0,10 Prozentpunkten geht der SARON-Alarm automatisch an die angemeldeten Kunden.",
      `${SITE}/admin/hypotheken`,
      ""
    );
  }

  // 3. Werktags: was sonst ansteht (Leads, Bewerbungen, Wiedervorlagen)
  let offenCount = 0;
  if (isWorkday) {
    const [leadsRes, customersRes] = await Promise.all([
      admin.from("leads").select("*").order("created_at", { ascending: true }).limit(2000),
      admin.from("customers").select("id, full_name, berater, follow_up_at, typ").lte("follow_up_at", today).neq("typ", "ex"),
    ]);
    const leads = ((leadsRes.data ?? []) as Row[]).filter((l) => !l.archived_at && l.status !== "abgeschlossen" && l.status !== "irrelevant");
    const age = (l: Row) => (now.getTime() - new Date(l.created_at as string).getTime()) / DAY;
    const who = (r: Row) => (r.berater ? ` [${r.berater}]` : "");
    const bewerbungen = leads.filter((l) => l.source === "bewerbung" && l.status === "neu" && age(l) >= 7);
    const offen = leads.filter((l) => l.source !== "bewerbung" && l.status === "neu" && age(l) >= 3);
    const leadFollow = leads.filter((l) => l.follow_up_at && (l.follow_up_at as string) <= today);
    const customerFollow = (customersRes.data ?? []) as Row[];
    offenCount = offen.length;

    if (bewerbungen.length) {
      sections.push("BEWERBUNGEN OHNE ANTWORT SEIT 7+ TAGEN (versprochen: innert 10 Tagen)", ...bewerbungen.map((l) => `• ${l.name}, vor ${Math.floor(age(l))} Tagen`), "");
    }
    if (offen.length) {
      sections.push(`NEUE LEADS SEIT 3+ TAGEN OHNE KONTAKT (${offen.length})`, ...offen.slice(0, 20).map((l) => `• ${l.name} (${l.source || l.type}), ${Math.floor(age(l))} Tage${who(l)}`), "");
    }
    if (leadFollow.length || customerFollow.length) {
      sections.push(
        `WIEDERVORLAGE FÄLLIG (${leadFollow.length + customerFollow.length})`,
        ...leadFollow.slice(0, 20).map((l) => `• Lead ${l.name}${who(l)}`),
        ...customerFollow.slice(0, 20).map((c) => `• Kunde ${c.full_name}${who(c)}`),
        ""
      );
    }
  }

  if (!isWorkday && !heute.length) return NextResponse.json({ ok: true, gesendet: false, grund: "Wochenende ohne Termine" });

  const subjectParts = [
    heute.length ? `${heute.length} ${heute.length === 1 ? "Termin" : "Termine"} heute` : "keine Termine heute",
    offenCount ? `${offenCount} offene Leads` : null,
  ].filter(Boolean);
  const subject = isMonday ? `Wochenstart: ${subjectParts.join(", ")} · Richtzinsen prüfen` : `Guten Morgen: ${subjectParts.join(", ")}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: TEAM,
    subject,
    text: ["Guten Morgen", "", ...sections, `Kalender und CRM: ${SITE}/admin/kalender`].join("\n"),
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, gesendet: true, heute: heute.length, woche: isMonday ? agenda.length : undefined });
}
