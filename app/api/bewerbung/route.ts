import { NextResponse } from "next/server";
import { createResendClient } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

const NOTIFY_TO = process.env.JOBS_EMAIL_TO || process.env.LEADS_EMAIL_TO || "verkaufen@novidom-immo.ch";
const NOTIFY_FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Vercel nimmt Anfragen bis 4,5 MB an; etwas Luft für die Formularfelder
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const ALLOWED = /\.(pdf|docx?|jpe?g|png)$/i;

function field(form: FormData, key: string, max = 200) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Bewerbung von /karriere: geht mit den Unterlagen als Anhang per Mail ans
 * Team und erscheint als Lead (Quelle «bewerbung») im Admin, ohne Kundenakte.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage. Sind die Dateien zusammen kleiner als 4 MB?" }, { status: 400 });
  }

  // Honeypot: echte Besucher füllen dieses versteckte Feld nie aus
  if (field(form, "website")) return NextResponse.json({ ok: true });

  const name = field(form, "name");
  const email = field(form, "email");
  const phone = field(form, "phone", 50);
  const bereich = field(form, "bereich", 80);
  const pensum = field(form, "pensum", 80);
  const region = field(form, "region", 80);
  const message = field(form, "message", 4000);

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name und eine gültige E-Mail-Adresse sind erforderlich." }, { status: 400 });
  }

  const files = form.getAll("unterlagen").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.some((f) => !ALLOWED.test(f.name))) {
    return NextResponse.json({ error: "Bitte nur PDF, Word oder Bilder hochladen." }, { status: 400 });
  }
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "Die Unterlagen sind zusammen grösser als 4 MB." }, { status: 400 });
  }

  const summary = [
    `Bereich: ${bereich || "—"}`,
    `Pensum: ${pensum || "—"}`,
    `Region: ${region || "—"}`,
    `Unterlagen: ${files.length ? files.map((f) => f.name).join(", ") : "keine"}`,
    "",
    message || "—",
  ].join("\n");

  const supabase = await createClient();
  if (supabase) {
    // Best-effort; die Mail mit den Unterlagen ist der eigentliche Weg
    await supabase.from("leads").insert({ type: "contact", name, email, phone: phone || null, message: `Bewerbung\n${summary}`, source: "bewerbung" });
  }

  const resend = createResendClient();
  if (!resend) return NextResponse.json({ error: "Versand ist noch nicht eingerichtet. Bitte per E-Mail bewerben." }, { status: 503 });

  const attachments = await Promise.all(files.map(async (f) => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()) })));
  const { error } = await resend.emails.send({
    from: NOTIFY_FROM,
    to: NOTIFY_TO,
    replyTo: email,
    subject: `Bewerbung: ${name}${bereich ? ` (${bereich})` : ""}`,
    text: `Neue Bewerbung über die Website\n\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone || "—"}\n${summary}`,
    attachments,
  });
  if (error) return NextResponse.json({ error: "Versand fehlgeschlagen. Bitte später nochmals versuchen." }, { status: 502 });

  await resend.emails.send({
    from: NOTIFY_FROM,
    to: email,
    subject: "Ihre Bewerbung bei der NoviDom Immobilien AG",
    text: `Hallo ${name.split(" ")[0]}\n\nVielen Dank für Ihre Bewerbung und Ihr Interesse an NoviDom. Wir schauen uns Ihre Unterlagen persönlich an und melden uns innert zehn Arbeitstagen.\n\nFreundliche Grüsse\nIhr Team der NoviDom Immobilien AG`,
  });

  return NextResponse.json({ ok: true });
}
