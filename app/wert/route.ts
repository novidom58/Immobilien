import { NextResponse } from "next/server";

/**
 * Kurzer Link für QR-Codes auf Türhängern und Flyern: /wert?q=allschwil
 * führt zum Wertmonitor und merkt sich, woher die Person kommt. So sieht
 * man im CRM, welches Quartier und welcher Druck antwortet.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  const target = new URL(`/leistungen/kaufen-verkaufen${q ? `?quelle=${q}` : ""}#wertmonitor`, url.origin);
  return NextResponse.redirect(target, 307);
}
