import { NextResponse } from "next/server";
import { createResendClient } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

const NOTIFY_TO = process.env.LEADS_EMAIL_TO || "beratung@novidom-immo.ch";
const NOTIFY_FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_TYPES = new Set(["contact", "valuation", "access_request"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field in.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const type = typeof body.type === "string" && VALID_TYPES.has(body.type) ? body.type : "contact";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 50) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";
  const wantsFinancing = body.wantsFinancing === true;
  const newsletterOptIn = body.newsletterOptIn === true;
  const listingId = typeof body.listingId === "string" && UUID_RE.test(body.listingId) ? body.listingId : null;

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name und eine gültige E-Mail-Adresse sind erforderlich." }, { status: 400 });
  }

  const results = { stored: false, emailed: false };

  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("leads").insert({
      type,
      name,
      email,
      phone: phone || null,
      message: message || null,
      wants_financing: wantsFinancing,
      newsletter_opt_in: newsletterOptIn,
      listing_id: listingId,
    });
    results.stored = !error;

    if (newsletterOptIn) {
      // Best-effort - Duplikate (bereits abonniert, unique-Constraint) sind kein Fehlerfall.
      await supabase.from("newsletter_subscribers").insert({ email, source: type });
    }
  }

  const resend = createResendClient();
  if (resend) {
    const { error } = await resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      replyTo: email,
      subject: `Neue Anfrage (${type}) von ${name}`,
      text: `Typ: ${type}\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone || "—"}\n\nNachricht:\n${message || "—"}`,
    });
    results.emailed = !error;

    // Best-effort auto-reply to the submitter. Failing this never fails the
    // request - the internal notification above already went through.
    if (!error) {
      const firstName = name.split(" ")[0];
      await resend.emails.send({
        from: NOTIFY_FROM,
        to: email,
        subject: "Ihre Anfrage bei NoviDom Immo ist eingegangen",
        text: `Hallo ${firstName}\n\nVielen Dank für Ihre Anfrage. Wir haben sie erhalten und melden uns innert kurzer Zeit persönlich bei Ihnen.\n\nFreundliche Grüsse\nJana Schnuderl\nNoviDom Immo`,
      });
    }
  }

  if (!results.stored && !results.emailed) {
    return NextResponse.json(
      {
        error:
          "Die Anfrage konnte nicht zugestellt werden (E-Mail-Versand ist noch nicht eingerichtet). Bitte direkt per E-Mail melden.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, ...results });
}
