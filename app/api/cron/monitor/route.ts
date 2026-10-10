import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";
import { formatChf, PRICE_STAND } from "@/lib/valuation";
import { ownerValue, parseOwnerInput } from "@/lib/wertmonitor";

export const dynamic = "force-dynamic";

const FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";
const TEAM = process.env.LEADS_EMAIL_TO || "verkaufen@novidom-immo.ch";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";
const QUARTER_MS = 90 * 24 * 3_600_000;

/**
 * Wöchentlich (Vercel Cron, siehe vercel.json):
 * 1. Wertmonitor: Eigentümer erhalten alle 90 Tage ihren Richtwert.
 * 2. Hypothekenwächter: 12 Monate vor Ablauf eine Erinnerung an den Kunden,
 *    dazu eine Übersicht fürs Team mit allen Hypotheken der nächsten 12 Monate.
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

  // 1. Wertmonitor
  const { data: owners } = await admin
    .from("customers")
    .select("id, full_name, email, wertmonitor")
    .not("wertmonitor", "is", null)
    .not("email", "is", null)
    .neq("typ", "ex");
  let wertSent = 0;
  for (const o of owners ?? []) {
    const wm = o.wertmonitor as Record<string, unknown> & { wert?: { mid: number }; last_sent_at?: string };
    if (wm.last_sent_at && Date.now() - new Date(wm.last_sent_at).getTime() < QUARTER_MS) continue;
    const input = parseOwnerInput(wm);
    if (!input) continue;
    const wert = ownerValue(input);
    const before = wm.wert?.mid;
    const delta = before ? wert.mid - before : 0;
    const firstName = (o.full_name || "").split(" ")[0] || "Guten Tag";
    const { error } = await resend.emails.send({
      from: FROM,
      to: o.email as string,
      subject: `Ihr Wertmonitor ${PRICE_STAND}: ${formatChf(wert.mid)}`,
      text: [
        `Hallo ${firstName}`,
        "",
        `Ihr vierteljährlicher Wertmonitor für ${input.typ}, ${input.flaeche} m², ${input.region}:`,
        "",
        `Geschätzter Marktwert: ${formatChf(wert.low)} – ${formatChf(wert.high)}`,
        before && delta !== 0 ? `Veränderung zum letzten Quartal: ${delta > 0 ? "+" : "−"}${formatChf(Math.abs(delta))}` : "Gegenüber dem letzten Quartal stabil.",
        "",
        "Möchten Sie es genau wissen? Wir machen gerne eine kostenlose, bankanerkannte Bewertung vor Ort.",
        `${SITE}/leistungen/kaufen-verkaufen`,
        "",
        "Keine Updates mehr? Einfach kurz antworten.",
        "",
        "Freundliche Grüsse",
        "Ihr Team von NoviDom Immo",
      ].join("\n"),
    });
    if (error) continue;
    wertSent++;
    await admin.from("customers").update({ wertmonitor: { ...wm, wert, last_sent_at: new Date().toISOString() } }).eq("id", o.id);
    await admin.from("customer_activity").insert({ customer_id: o.id, type: "email", text: `Wertmonitor verschickt (${formatChf(wert.mid)})` });
  }

  // 2. Hypothekenwächter
  const today = new Date();
  const inOneYear = new Date(today.getTime() + 365 * 24 * 3_600_000);
  const { data: hypos } = await admin
    .from("customers")
    .select("id, full_name, email, phone, hypo_ablauf, hypo_betrag, hypo_bank, hypo_erinnert_at")
    .not("hypo_ablauf", "is", null)
    .gte("hypo_ablauf", today.toISOString().slice(0, 10))
    .lte("hypo_ablauf", inOneYear.toISOString().slice(0, 10))
    .neq("typ", "ex")
    .order("hypo_ablauf", { ascending: true });

  let hypoSent = 0;
  for (const h of hypos ?? []) {
    if (h.hypo_erinnert_at || !h.email) continue;
    const firstName = (h.full_name || "").split(" ")[0] || "Guten Tag";
    const datum = new Date(h.hypo_ablauf as string).toLocaleDateString("de-CH");
    const { error } = await resend.emails.send({
      from: FROM,
      to: h.email,
      subject: `Ihre Hypothek läuft am ${datum} ab`,
      text: [
        `Hallo ${firstName}`,
        "",
        `Ihre Hypothek${h.hypo_bank ? ` bei ${h.hypo_bank}` : ""} läuft am ${datum} ab. Jetzt ist der beste Zeitpunkt zum Vergleichen: Viele Anbieter offerieren bis zu 12 Monate im Voraus, und Sie können sich gute Zinsen sichern.`,
        "",
        "Mit unserem Partner HypoCasa vergleichen wir über 50 Banken, Versicherungen und Pensionskassen. Kostenlos und unverbindlich.",
        "",
        "Antworten Sie einfach auf diese Mail, dann melden wir uns.",
        "",
        "Freundliche Grüsse",
        "Ihr Team von NoviDom Immo",
      ].join("\n"),
    });
    if (error) continue;
    hypoSent++;
    await admin.from("customers").update({ hypo_erinnert_at: new Date().toISOString() }).eq("id", h.id);
    await admin.from("customer_activity").insert({ customer_id: h.id, type: "email", text: `Hypothekenwächter: Erinnerung zum Ablauf am ${datum}` });
  }

  if ((hypos ?? []).length > 0) {
    const lines = (hypos ?? []).map((h) => {
      const datum = new Date(h.hypo_ablauf as string).toLocaleDateString("de-CH");
      const betrag = h.hypo_betrag ? ` · ${formatChf(h.hypo_betrag)}` : "";
      return `${datum}  ${h.full_name}${betrag}${h.hypo_bank ? ` · ${h.hypo_bank}` : ""}${h.phone ? ` · ${h.phone}` : ""}`;
    });
    await resend.emails.send({
      from: FROM,
      to: TEAM,
      subject: `Hypothekenwächter: ${lines.length} Hypothek(en) laufen in den nächsten 12 Monaten ab`,
      text: [...lines, "", `Übersicht im Admin: ${SITE}/admin/hypotheken`].join("\n"),
    });
  }

  return NextResponse.json({ ok: true, wertmonitor: wertSent, hypothekenwaechter: hypoSent });
}
