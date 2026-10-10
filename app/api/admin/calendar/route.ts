import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseIcs } from "@/lib/ics";

// Nur veröffentlichte Kalender der bekannten Anbieter abrufen, damit die
// Route nicht als offener Proxy missbraucht werden kann.
const ALLOWED_HOSTS = ["outlook.live.com", "outlook.office365.com", "outlook.office.com", "calendar.google.com"];

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

  const raw = new URL(request.url).searchParams.get("url") ?? "";
  let target: URL;
  try {
    target = new URL(raw.replace(/^webcals?:\/\//i, "https://"));
  } catch {
    return NextResponse.json({ error: "Ungültiger Link." }, { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.includes(target.hostname)) {
    return NextResponse.json({ error: "Bitte den ICS-Link aus Outlook oder Google verwenden." }, { status: 400 });
  }

  const res = await fetch(target, { cache: "no-store", headers: { Accept: "text/calendar" } }).catch(() => null);
  const text = res && res.ok ? await res.text() : null;
  if (!text || !text.includes("BEGIN:VCALENDAR")) {
    return NextResponse.json(
      { error: "Der Kalender konnte nicht gelesen werden. Ist es der ICS-Link und ist der Kalender veröffentlicht?" },
      { status: 502 }
    );
  }

  const now = new Date();
  const from = new Date(now.getTime() - 24 * 3600 * 1000);
  const to = new Date(now.getTime() + 60 * 24 * 3600 * 1000);
  return NextResponse.json({ events: parseIcs(text, from, to) });
}
