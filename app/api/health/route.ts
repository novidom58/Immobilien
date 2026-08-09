import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnose-Endpoint: /api/health aufrufen, um zu sehen, ob das Deployment
 * korrekt konfiguriert ist. Gibt keine Secrets aus - nur ob Werte gesetzt
 * sind und ob Supabase erreichbar ist.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseReachable: boolean | string = false;
  if (url && key) {
    try {
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: key },
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });
      supabaseReachable = res.ok ? true : `HTTP ${res.status}`;
    } catch (e) {
      supabaseReachable = e instanceof Error ? e.message : "fetch failed";
    }
  }

  return NextResponse.json({
    supabase_url_gesetzt: Boolean(url),
    supabase_anon_key_gesetzt: Boolean(key),
    supabase_erreichbar: supabaseReachable,
    resend_key_gesetzt: Boolean(process.env.RESEND_API_KEY),
    hinweis:
      !url || !key
        ? "Supabase-Env-Variablen fehlen in diesem Deployment. In Vercel unter Settings -> Environment Variables eintragen und danach neu deployen."
        : supabaseReachable === true
          ? "Alles korrekt konfiguriert. Wenn der Login trotzdem fehlschlaegt, liegt es an E-Mail-Bestaetigung, Passwort oder Admin-Rolle."
          : "Env-Variablen gesetzt, aber Supabase nicht erreichbar - URL und Key auf Tippfehler pruefen.",
  });
}
