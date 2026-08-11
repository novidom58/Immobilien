import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse angeben." }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Newsletter ist noch nicht eingerichtet." }, { status: 503 });
  }

  const { error } = await supabase.from("newsletter_subscribers").insert({ email, source: "footer" });
  // Unique-Constraint-Verletzung (bereits abonniert) wird dem Nutzer als Erfolg angezeigt.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
