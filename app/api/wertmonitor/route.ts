import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createResendClient } from "@/lib/resend";
import { parseOwnerInput, upsertOwner } from "@/lib/wertmonitor";
import { formatChf, PRICE_STAND } from "@/lib/valuation";

const NOTIFY_TO = process.env.LEADS_EMAIL_TO || "verkaufen@novidom-immo.ch";
const NOTIFY_FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Öffentliche Anmeldung zum Wertmonitor (und optional Hypothekenwächter). */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const name = String(body.name ?? "").trim().slice(0, 200);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const phone = String(body.phone ?? "").trim().slice(0, 50);
  const input = parseOwnerInput(body);
  if (!name || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Name und eine gültige E-Mail-Adresse sind erforderlich." }, { status: 400 });
  if (!input) return NextResponse.json({ error: "Bitte Region, Objektart und Wohnfläche angeben." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Bitte bestätigen Sie, dass wir Ihnen den Wertmonitor schicken dürfen." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Der Wertmonitor ist noch nicht eingerichtet." }, { status: 503 });
  const admin = createSupabaseClient(url, key);

  const { wert } = await upsertOwner(admin, { email, name, phone }, input, "Wertmonitor");
  await admin.from("leads").insert({
    type: "valuation",
    name,
    email,
    phone: phone || null,
    source: "wertmonitor",
    message: [
      `Wertmonitor-Anmeldung: ${input.typ}, ${input.flaeche} m², ${input.region}${input.adresse ? `, ${input.adresse}` : ""}`,
      `Richtwert: ${formatChf(wert.low)} – ${formatChf(wert.high)}`,
      input.hypo_ablauf ? `Hypothek läuft ab: ${new Date(input.hypo_ablauf).toLocaleDateString("de-CH")}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  const resend = createResendClient();
  if (resend) {
    const firstName = name.split(" ")[0];
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: email,
      subject: "Ihr Wertmonitor von NoviDom Immo",
      text: [
        `Hallo ${firstName}`,
        "",
        `Danke für Ihre Anmeldung. Hier Ihr erster Richtwert (${PRICE_STAND}):`,
        "",
        `${input.typ}, ${input.flaeche} m², ${input.region}`,
        `Geschätzter Marktwert: ${formatChf(wert.low)} – ${formatChf(wert.high)}`,
        "",
        "Ab jetzt erhalten Sie jedes Quartal ein Update. Für eine genaue, bankanerkannte Bewertung antworten Sie einfach auf diese Mail.",
        input.hypo_ablauf ? "\nIhre Hypothek behalten wir im Blick und melden uns rechtzeitig vor dem Ablauf mit besseren Konditionen." : "",
        "",
        "Freundliche Grüsse",
        "Ihr Team von NoviDom Immo",
      ].join("\n"),
    });
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      replyTo: email,
      subject: `Wertmonitor: ${name} (${input.region})`,
      text: `${name}\n${email}\n${phone || "—"}\n\n${input.typ}, ${input.flaeche} m², ${input.region}\nRichtwert ${formatChf(wert.mid)}${input.hypo_ablauf ? `\nHypothek bis ${input.hypo_ablauf}` : ""}`,
    });
  }

  return NextResponse.json({ ok: true, wert });
}
