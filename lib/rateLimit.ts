import { NextResponse } from "next/server";

// Einfache Begrenzung pro IP gegen Formular-Spam. Läuft im Speicher der
// jeweiligen Server-Instanz: kein perfekter Schutz, bremst aber Skripte, die
// ein Formular in kurzer Zeit oft abschicken.
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "unbekannt").trim();
}

/**
 * Gibt eine 429-Antwort zurück, wenn diese IP das Formular `bucket` öfter als
 * `max`-mal im Zeitfenster `windowMs` abgeschickt hat, sonst null.
 */
export function rateLimit(request: Request, bucket: string, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const key = `${bucket}:${clientIp(request)}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return NextResponse.json(
      { error: "Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es in ein paar Minuten nochmals." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } }
    );
  }
  recent.push(now);
  hits.set(key, recent);
  // Speicher klein halten
  if (hits.size > 5000) {
    for (const [k, list] of hits) if (list.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return null;
}
