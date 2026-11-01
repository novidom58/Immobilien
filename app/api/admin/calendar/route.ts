import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseIcs } from "@/lib/ics";
import { loadCaldav } from "@/lib/caldav";

// Nur veröffentlichte Kalender der bekannten Anbieter abrufen, damit die
// Route nicht als offener Proxy missbraucht werden kann.
const ALLOWED_HOSTS = ["outlook.live.com", "outlook.office365.com", "outlook.office.com", "calendar.google.com"];
const allowedHost = (host: string) => ALLOWED_HOSTS.includes(host) || host.endsWith(".hostpoint.ch");

/**
 * Lädt eine ICS-Datei. Zugangsdaten im Link (https://user:pass@host/…) werden
 * als Basic-Auth gesendet, z.B. für den CalDAV-Kalender bei Hostpoint.
 */
async function loadIcs(target: URL) {
  const headers: Record<string, string> = { Accept: "text/calendar" };
  if (target.username) {
    const user = decodeURIComponent(target.username);
    const pass = decodeURIComponent(target.password);
    headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
    target = new URL(target.href);
    target.username = "";
    target.password = "";
  }
  const res = await fetch(target, { cache: "no-store", headers }).catch(() => null);
  const text = res && res.ok ? await res.text() : null;
  return text && text.includes("BEGIN:VCALENDAR") ? text : null;
}

/** Gemeinsame Kalender aus Vercel (KALENDER_ICS_URL, mehrere mit Komma). */
function sharedUrls() {
  return (process.env.KALENDER_ICS_URL ?? "")
    .split(",")
    .map((u) => u.trim().replace(/^webcals?:\/\//i, "https://"))
    .filter(Boolean);
}

/**
 * Liest einen veröffentlichten Kalender (ICS-Link) für die Admin-Kalenderseite
 * und gibt die Termine der nächsten Wochen zurück. Nur für Admins.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Nicht eingerichtet." }, { status: 503 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Keine Admin-Rechte." }, { status: 403 });

  const params = new URL(request.url).searchParams;
  // Zeitraum aus der Kalenderansicht (Monat), höchstens 100 Tage
  const now = new Date();
  const fromParam = new Date(params.get("from") ?? "");
  const toParam = new Date(params.get("to") ?? "");
  const validRange =
    !Number.isNaN(fromParam.getTime()) && !Number.isNaN(toParam.getTime()) && toParam > fromParam && toParam.getTime() - fromParam.getTime() <= 100 * 864e5;
  const from = validRange ? fromParam : new Date(now.getTime() - 24 * 3600 * 1000);
  const to = validRange ? toParam : new Date(now.getTime() + 60 * 24 * 3600 * 1000);

  if (params.get("shared")) {
    const urls = sharedUrls();
    const caldavUrl = process.env.KALENDER_CALDAV_URL?.trim();
    const caldavUser = process.env.KALENDER_CALDAV_USER?.trim();
    const caldavPass = process.env.KALENDER_CALDAV_PASSWORD ?? "";
    if (urls.length === 0 && !caldavUrl) return NextResponse.json({ error: "Kein gemeinsamer Kalender hinterlegt." }, { status: 404 });

    const loads: Promise<string | null>[] = urls.map((u) => loadIcs(new URL(u)).catch(() => null));
    let authFailed = false;
    if (caldavUrl && caldavUser) {
      loads.push(
        loadCaldav(caldavUrl, { user: caldavUser, pass: caldavPass }, from, to).catch((e) => {
          if (e instanceof Error && e.message === "auth") authFailed = true;
          return null;
        })
      );
    }
    const texts = await Promise.all(loads);
    if (texts.every((t) => !t)) {
      return NextResponse.json(
        {
          error: authFailed
            ? "Hostpoint lehnt die Anmeldung ab: Benutzer oder Passwort in Vercel prüfen (KALENDER_CALDAV_USER / KALENDER_CALDAV_PASSWORD)."
            : "Der gemeinsame Kalender konnte nicht gelesen werden. Adresse in Vercel prüfen (dieselbe wie in Cal.com).",
        },
        { status: 502 }
      );
    }
    const events = texts.flatMap((t) => (t ? parseIcs(t, from, to) : [])).sort((a, b) => a.start.localeCompare(b.start));
    return NextResponse.json({ events });
  }

  const raw = params.get("url") ?? "";
  let target: URL;
  try {
    target = new URL(raw.replace(/^webcals?:\/\//i, "https://"));
  } catch {
    return NextResponse.json({ error: "Ungültiger Link." }, { status: 400 });
  }
  if (target.protocol !== "https:" || !allowedHost(target.hostname)) {
    return NextResponse.json({ error: "Bitte den ICS-Link aus Outlook oder Google verwenden." }, { status: 400 });
  }

  const text = await loadIcs(target);
  if (!text) {
    return NextResponse.json(
      { error: "Der Kalender konnte nicht gelesen werden. Ist es der ICS-Link und ist der Kalender veröffentlicht?" },
      { status: 502 }
    );
  }

  return NextResponse.json({ events: parseIcs(text, from, to) });
}
