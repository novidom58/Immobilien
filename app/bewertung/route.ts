import { NextResponse } from "next/server";

/**
 * Kurzer Link zur kostenlosen Bewertung, z.B. für die Instagram-Bio:
 * /bewertung?q=instagram führt direkt zum Formular auf der Startseite und
 * merkt sich die Herkunft (wird im Formular als Quelle vorausgewählt).
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const target = new URL(`/${q ? `?quelle=${q}` : ""}#bewertung`, url.origin);
  return NextResponse.redirect(target, 307);
}
