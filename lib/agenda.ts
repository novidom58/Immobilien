import type { SupabaseClient } from "@supabase/supabase-js";
import { parseIcs } from "@/lib/ics";
import { loadCaldav } from "@/lib/caldav";

export type AgendaItem = {
  start: string; // ISO
  allDay: boolean;
  title: string;
  /** Berater/in oder «Firmenkalender» */
  who: string;
  detail: string | null;
};

const ZONE = "Europe/Zurich";

export const zTime = (iso: string) => new Date(iso).toLocaleTimeString("de-CH", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });
export const zDay = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: ZONE });
export const zDayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("de-CH", { timeZone: ZONE, weekday: "long", day: "numeric", month: "long" });

/** Gemeinsamer Kalender (CalDAV bei Hostpoint und/oder ICS-Links aus Vercel). */
async function sharedCalendar(from: Date, to: Date) {
  const loads: Promise<string | null>[] = (process.env.KALENDER_ICS_URL ?? "")
    .split(",")
    .map((u) => u.trim().replace(/^webcals?:\/\//i, "https://"))
    .filter(Boolean)
    .map((u) =>
      fetch(u, { cache: "no-store", headers: { Accept: "text/calendar" } })
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null)
    );
  const url = process.env.KALENDER_CALDAV_URL?.trim();
  const user = process.env.KALENDER_CALDAV_USER?.trim();
  if (url && user) loads.push(loadCaldav(url, { user, pass: process.env.KALENDER_CALDAV_PASSWORD ?? "" }, from, to).catch(() => null));
  const texts = await Promise.all(loads);
  return texts.flatMap((t) => (t && t.includes("BEGIN:VCALENDAR") ? parseIcs(t, from, to) : []));
}

/**
 * Alle Termine im Zeitraum: CRM-Termine (mit Kunde, Objekt, Berater/in) und
 * der gemeinsame Firmenkalender. Doppelte Einträge (gleiche Minute, gleicher
 * Titel) erscheinen nur einmal.
 */
export async function loadAgenda(admin: SupabaseClient, from: Date, to: Date): Promise<AgendaItem[]> {
  const [{ data }, shared] = await Promise.all([
    admin
      .from("termine")
      .select("title, type, starts_at, berater, notes, customers(full_name, phone), listings(title, address, city)")
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString())
      .order("starts_at"),
    sharedCalendar(from, to),
  ]);

  const items: AgendaItem[] = ((data ?? []) as Record<string, unknown>[]).map((t) => {
    const customer = t.customers as { full_name?: string | null; phone?: string | null } | null;
    const listing = t.listings as { title?: string | null; address?: string; city?: string } | null;
    const detail = [
      customer?.full_name ? `${customer.full_name}${customer.phone ? `, ${customer.phone}` : ""}` : null,
      listing ? listing.title || `${listing.address}, ${listing.city}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      start: t.starts_at as string,
      allDay: false,
      title: t.title as string,
      who: (t.berater as string | null) || "Ohne Zuteilung",
      detail: detail || null,
    };
  });

  const key = (i: { start: string; title: string }) => `${new Date(i.start).toISOString().slice(0, 16)}|${i.title.trim().toLowerCase()}`;
  const seen = new Set(items.map(key));
  for (const e of shared) {
    if (seen.has(key(e))) continue;
    seen.add(key(e));
    items.push({ start: e.start, allDay: e.allDay, title: e.title, who: "Firmenkalender", detail: e.location });
  }
  return items.sort((a, b) => a.start.localeCompare(b.start));
}

/** Eine Zeile pro Termin für die Mail. */
export function agendaLine(i: AgendaItem, withWho = true) {
  const time = i.allDay ? "ganztags" : zTime(i.start);
  return `• ${time}  ${i.title}${withWho ? ` [${i.who}]` : ""}${i.detail ? `\n    ${i.detail}` : ""}`;
}
