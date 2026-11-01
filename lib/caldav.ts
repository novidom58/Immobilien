// Minimaler CalDAV-Leser für den Firmenkalender (z.B. Hostpoint). Nimmt
// dieselbe Adresse wie Cal.com: entweder direkt einen Kalender oder die
// Server-Adresse, dann werden die Kalender automatisch gesucht.

type Creds = { user: string; pass: string };

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#13;/g, "")
    .replace(/&#10;/g, "\n")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const tag = (name: string) => new RegExp(`<(?:[\\w-]+:)?${name}\\b[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${name}>`, "gi");

function all(xml: string, name: string) {
  return [...xml.matchAll(tag(name))].map((m) => m[1]);
}

function icsStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

async function dav(url: string, method: string, body: string, depth: string, creds: Creds) {
  const res = await fetch(url, {
    method,
    cache: "no-store",
    headers: {
      Authorization: `Basic ${Buffer.from(`${creds.user}:${creds.pass}`).toString("base64")}`,
      "Content-Type": "application/xml; charset=utf-8",
      Depth: depth,
    },
    body,
  });
  if (res.status === 401 || res.status === 403) throw new Error("auth");
  return res.ok || res.status === 207 ? res.text() : null;
}

async function report(calendarUrl: string, from: Date, to: Date, creds: Creds) {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop><c:calendar-data/></d:prop>
  <c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT">
    <c:time-range start="${icsStamp(from)}" end="${icsStamp(to)}"/>
  </c:comp-filter></c:comp-filter></c:filter>
</c:calendar-query>`;
  const xml = await dav(calendarUrl, "REPORT", body, "1", creds);
  return xml ? all(xml, "calendar-data").map(decode) : null;
}

function absolute(href: string, base: string) {
  return new URL(decode(href).trim(), base).href;
}

async function findCalendars(start: string, creds: Creds) {
  const propfind = (props: string) =>
    `<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop>${props}</d:prop></d:propfind>`;

  let principal = start;
  const p = await dav(start, "PROPFIND", propfind("<d:current-user-principal/>"), "0", creds);
  const principalHref = p ? all(all(p, "current-user-principal")[0] ?? "", "href")[0] : null;
  if (principalHref) principal = absolute(principalHref, start);

  let home = principal;
  const h = await dav(principal, "PROPFIND", propfind("<c:calendar-home-set/>"), "0", creds);
  const homeHref = h ? all(all(h, "calendar-home-set")[0] ?? "", "href")[0] : null;
  if (homeHref) home = absolute(homeHref, principal);

  const list = await dav(home, "PROPFIND", propfind("<d:resourcetype/><d:displayname/>"), "1", creds);
  if (!list) return [];
  return all(list, "response")
    .filter((r) => /<(?:[\w-]+:)?calendar\b/i.test(all(r, "resourcetype")[0] ?? ""))
    .map((r) => absolute(all(r, "href")[0] ?? "", home));
}

/** Liefert den Inhalt aller Termine im Zeitraum als ICS-Text (für parseIcs). */
export async function loadCaldav(url: string, creds: Creds, from: Date, to: Date): Promise<string | null> {
  // 1. Die Adresse ist schon ein Kalender
  const direct = await report(url, from, to, creds).catch((e) => {
    if (e instanceof Error && e.message === "auth") throw e;
    return null;
  });
  if (direct && direct.length) return direct.join("\n");

  // 2. Server-Adresse: Kalender suchen und alle abfragen
  const calendars = await findCalendars(url, creds);
  const parts = await Promise.all(calendars.map((c) => report(c, from, to, creds).catch(() => null)));
  const texts = parts.flatMap((p) => p ?? []);
  if (texts.length) return texts.join("\n");
  return direct || calendars.length ? "BEGIN:VCALENDAR\nEND:VCALENDAR" : null;
}
