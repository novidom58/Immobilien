import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { createResendClient } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";
import { syncLeadToCrm } from "@/lib/leadCrm";

// Anfragen von HypoCasa, deren Kunde der Weitergabe an NoviDom ausdrücklich
// zugestimmt hat (Häkchen auf hypocasa.ch → «einwilligung: true»). Sie landen als
// Lead (Quelle «HypoCasa · …») und in der Kundenakte; bestehende Kunden (gleiche
// E-Mail) werden ergänzt statt doppelt angelegt. Das HypoCasa-CRM ruft diese
// Adresse vom Server aus auf, mit dem Schlüssel NOVIDOM_PARTNER_KEY im Header X-ND-Key.

const NOTIFY_TO = process.env.LEADS_EMAIL_TO || "verkaufen@novidom-immo.ch";
const NOTIFY_FROM = process.env.LEADS_EMAIL_FROM || "NoviDom Immobilien AG <onboarding@resend.dev>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const THEMEN: Record<string, string> = {
  hypothek: "Hypothek",
  verlaengerung: "Hypothek verlängern",
  versicherung: "Versicherung",
  vorsorge: "Vorsorge",
  allgemein: "Allgemein",
};

/** Erlaubte Absender-Seiten: HypoCasa plus weitere über HYPOCASA_ORIGINS (kommagetrennt, z.B. Vorschau-Adressen). */
function allowedOrigins() {
  const extra = (process.env.HYPOCASA_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return new Set(["https://hypocasa.ch", "https://www.hypocasa.ch", ...extra]);
}

function cors(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function reply(request: Request, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: cors(request) });
}

export function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: cors(request) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins().has(origin)) return reply(request, { error: "Nicht erlaubt." }, 403);

  const limited = rateLimit(request, "hypocasa", 8);
  if (limited) return reply(request, { error: "Zu viele Anfragen in kurzer Zeit. Bitte später nochmals versuchen." }, 429);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return reply(request, { error: "Ungültige Anfrage." }, 400);
  }

  // Honeypot wie auf der NoviDom-Seite
  if (typeof body.website === "string" && body.website.trim() !== "") return reply(request, { ok: true });

  // Nur mit Schlüssel (falls gesetzt) und nur mit Einwilligung des Kunden
  const key = process.env.NOVIDOM_PARTNER_KEY;
  if (!key || request.headers.get("x-nd-key") !== key) return reply(request, { error: "Nicht erlaubt." }, 401);
  if (body.einwilligung !== true) return reply(request, { error: "Ohne Einwilligung des Kunden keine Weitergabe." }, 400);

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const vorname = str(body.first_name, 80);
  const nachname = str(body.last_name, 120);
  const name = str(body.name, 200) || `${vorname} ${nachname}`.trim();
  const email = str(body.email, 200);
  const phone = str(body.phone, 50);
  const message = str(body.message, 4000);
  const themaKey = typeof body.thema === "string" && body.thema in THEMEN ? body.thema : "allgemein";
  const thema = THEMEN[themaKey];
  const profile = body.profile && typeof body.profile === "object" && !Array.isArray(body.profile) ? (body.profile as Record<string, unknown>) : null;

  if (!name || !EMAIL_RE.test(email)) return reply(request, { error: "Name und eine gültige E-Mail-Adresse sind erforderlich." }, 400);

  const source = `HypoCasa · ${thema}`;
  const wantsFinancing = themaKey === "hypothek" || themaKey === "verlaengerung" || themaKey === "allgemein";
  const text = `Thema: ${thema}\nEinwilligung zur Weitergabe an NoviDom: ja${message ? `\n\n${message}` : ""}`;
  const results = { stored: false, emailed: false };

  const supabase = await createClient();
  if (supabase) {
    const { error } = await supabase.from("leads").insert({
      type: "contact",
      name,
      email,
      phone: phone || null,
      message: text,
      wants_financing: wantsFinancing,
      newsletter_opt_in: false,
      listing_id: null,
      source,
    });
    results.stored = !error;
    if (results.stored) {
      await syncLeadToCrm({
        type: "contact",
        name,
        email,
        phone: phone || null,
        message: text,
        source,
        listing_id: null,
        wants_financing: wantsFinancing,
        anliegen: null,
        profile,
      }).catch(() => {});
    }
  }

  const resend = createResendClient();
  if (resend) {
    const { error } = await resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      replyTo: email,
      subject: `Neue HypoCasa-Anfrage (${thema}) von ${name}`,
      text: `Über: HypoCasa\nThema: ${thema}\nName: ${name}\nE-Mail: ${email}\nTelefon: ${phone || "—"}\n\nNachricht:\n${message || "—"}`,
    });
    results.emailed = !error;
  }

  if (!results.stored && !results.emailed) return reply(request, { error: "Die Anfrage konnte nicht zugestellt werden." }, 503);
  return reply(request, { ok: true, ...results });
}
