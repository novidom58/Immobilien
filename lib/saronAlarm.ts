import type { SupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
const FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";

const LABEL: Record<string, string> = { saron: "SARON", "2": "2 Jahre fest", "3": "3 Jahre fest", "5": "5 Jahre fest", "7": "7 Jahre fest", "10": "10 Jahre fest" };
const ORDER = ["saron", "2", "3", "5", "7", "10"];
const pct = (v: number) => `${Number(v).toFixed(2)} %`;

/**
 * SARON-Alarm: Wer sich im Zinsbarometer angemeldet hat (Lead mit Quelle
 * «saron-alarm», nicht archiviert), bekommt eine Mail, sobald sich ein
 * Richtzins deutlich bewegt. Gibt die Anzahl verschickter Mails zurück.
 */
export async function sendSaronAlarm(
  supabase: SupabaseClient,
  rates: { laufzeit: string; zins: number; vorwoche: number | null }[],
  movedTerms: string[]
) {
  const resend = createResendClient();
  if (!resend) return 0;

  const { data: leads } = await supabase.from("leads").select("*").eq("source", "saron-alarm").limit(2000);
  const seen = new Set<string>();
  const subscribers = ((leads ?? []) as { id: string; email: string; name: string; archived_at?: string | null }[]).filter((l) => {
    const email = l.email?.toLowerCase();
    if (!email || l.archived_at || seen.has(email)) return false;
    seen.add(email);
    return true;
  });
  if (subscribers.length === 0) return 0;

  const sorted = [...rates].sort((a, b) => ORDER.indexOf(a.laufzeit) - ORDER.indexOf(b.laufzeit));
  const lines = sorted.map((r) => {
    const diff = r.vorwoche !== null ? Number(r.zins) - Number(r.vorwoche) : 0;
    const arrow = diff > 0.004 ? "▲" : diff < -0.004 ? "▼" : "=";
    return `${LABEL[r.laufzeit] ?? r.laufzeit}: ${pct(r.zins)} ${arrow}${r.vorwoche !== null ? ` (Vorwoche ${pct(r.vorwoche)})` : ""}`;
  });
  const movedText = movedTerms.map((t) => LABEL[t] ?? t).join(", ");
  const down = sorted.filter((r) => movedTerms.includes(r.laufzeit)).every((r) => r.vorwoche !== null && r.zins < r.vorwoche);

  let sent = 0;
  for (const s of subscribers) {
    const { error } = await resend.emails.send({
      from: FROM,
      to: s.email,
      subject: down ? `Zinsen gesunken: ${movedText}` : `Zinsen bewegen sich: ${movedText}`,
      text: [
        "Guten Tag",
        "",
        `Die Hypothekarzinsen haben sich diese Woche deutlich bewegt (${movedText}). Unsere aktuellen Richtzinsen:`,
        "",
        ...lines,
        "",
        down
          ? "Ein guter Moment, um Ihre Hypothek oder eine Verlängerung zu prüfen."
          : "Läuft Ihre Hypothek bald aus? Wir vergleichen kostenlos über 50 Anbieter.",
        `Richtzinsen und Rechner: ${SITE}/leistungen/finanzieren`,
        "",
        "Richtzinsen sind unverbindlich; Ihr persönlicher Zins hängt von Objekt und Tragbarkeit ab.",
        "Keine Zins-Mails mehr? Antworten Sie einfach mit «Abmelden».",
        "",
        "Freundliche Grüsse",
        "NoviDom Immobilien AG",
      ].join("\n"),
    });
    if (error) continue;
    sent++;
    await supabase.from("lead_activity").insert({ lead_id: s.id, type: "email", text: `SARON-Alarm verschickt (${movedText})` });
  }
  return sent;
}
