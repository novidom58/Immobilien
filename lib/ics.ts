// Minimaler iCalendar-Leser für veröffentlichte Outlook- und Google-Kalender.
// Liest Titel, Ort, Beginn und Ende und erweitert einfache wöchentliche und
// tägliche Serien; exotische Regeln werden als Einzeltermin gezeigt.

export type CalendarEvent = {
  title: string;
  location: string | null;
  start: string; // ISO
  end: string | null;
  allDay: boolean;
};

const ZONE = "Europe/Zurich";

function unfold(text: string) {
  return text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
}

function unescapeText(value: string) {
  return value.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
}

/** Versatz einer Zeitzone zu UTC in Minuten für einen Zeitpunkt. */
function zoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (asUtc - date.getTime()) / 60000;
}

/** "20261012T090000" (+ Z oder Zeitzone) bzw. "20261012" -> Date */
function parseIcsDate(value: string, params: string): { date: Date; allDay: boolean } | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (!h) return { date: new Date(Date.UTC(+y, +mo - 1, +d, 12)), allDay: true };
  const utcGuess = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +(s ?? 0)));
  if (z) return { date: utcGuess, allDay: false };
  // Lokale Zeit: Outlook nennt Windows-Zonen ("W. Europe Standard Time"),
  // für die Schweiz ist das dieselbe Uhrzeit wie Europe/Zurich.
  const tzid = params.match(/TZID=([^;:]+)/)?.[1];
  let zone = ZONE;
  if (tzid) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tzid });
      zone = tzid;
    } catch {
      zone = ZONE;
    }
  }
  const offset = zoneOffsetMinutes(utcGuess, zone);
  return { date: new Date(utcGuess.getTime() - offset * 60000), allDay: false };
}

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function localWeekday(date: Date) {
  return WEEKDAY_INDEX[new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "short" }).format(date)];
}

function expand(start: Date, rule: string, from: Date, to: Date) {
  const props = Object.fromEntries(rule.split(";").map((p) => p.split("=")));
  const freq = props.FREQ;
  if (freq !== "DAILY" && freq !== "WEEKLY") return [start];
  const interval = Math.max(1, Number(props.INTERVAL) || 1);
  const until = props.UNTIL ? parseIcsDate(props.UNTIL, "")?.date : undefined;
  const count = props.COUNT ? Number(props.COUNT) : undefined;
  const byDay: number[] = props.BYDAY
    ? props.BYDAY.split(",").map((d: string) => DAY_CODES.indexOf(d.slice(-2))).filter((d: number) => d >= 0)
    : [localWeekday(start)];

  const dayMs = 86400000;
  const startOffset = zoneOffsetMinutes(start, ZONE);
  // Ohne COUNT muss nicht ab Serienbeginn gezählt werden: kurz vor «from»
  // einsteigen, ausgerichtet auf den Rhythmus der Serie.
  const period = freq === "DAILY" ? interval : 7 * interval;
  let firstDay = 0;
  if (!count) {
    const daysToFrom = Math.floor((from.getTime() - start.getTime()) / dayMs);
    if (daysToFrom > period) firstDay = Math.floor((daysToFrom - period) / period) * period;
  }

  const out: Date[] = [];
  let produced = 0;
  for (let i = firstDay; i < firstDay + 4000; i++) {
    const raw = new Date(start.getTime() + i * dayMs);
    // Gleiche Uhrzeit auch über die Sommerzeit-Umstellung hinweg.
    const day = new Date(raw.getTime() + (startOffset - zoneOffsetMinutes(raw, ZONE)) * 60000);
    const matches =
      freq === "DAILY" ? i % interval === 0 : byDay.includes(localWeekday(day)) && Math.floor(i / 7) % interval === 0;
    if (!matches) continue;
    if (until && day > until) break;
    produced++;
    if (count && produced > count) break;
    if (day > to) break;
    if (day >= from) out.push(day);
  }
  return out;
}

export function parseIcs(text: string, from: Date, to: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  let current: Record<string, { value: string; params: string }> | null = null;
  const exdates: Set<number>[] = [];

  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      exdates.push(new Set());
      continue;
    }
    if (line === "END:VEVENT" && current) {
      const startRaw = current.DTSTART;
      const start = startRaw ? parseIcsDate(startRaw.value, startRaw.params) : null;
      if (start && current.STATUS?.value !== "CANCELLED") {
        const endRaw = current.DTEND;
        const end = endRaw ? parseIcsDate(endRaw.value, endRaw.params) : null;
        const duration = end ? end.date.getTime() - start.date.getTime() : 0;
        const occurrences = current.RRULE ? expand(start.date, current.RRULE.value, from, to) : [start.date];
        const skip = exdates[exdates.length - 1];
        for (const occ of occurrences) {
          if (skip.has(occ.getTime())) continue;
          const occEnd = duration ? new Date(occ.getTime() + duration) : null;
          if ((occEnd ?? occ) < from || occ > to) continue;
          events.push({
            title: unescapeText(current.SUMMARY?.value ?? "Termin"),
            location: current.LOCATION ? unescapeText(current.LOCATION.value) || null : null,
            start: occ.toISOString(),
            end: occEnd ? occEnd.toISOString() : null,
            allDay: start.allDay,
          });
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const head = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const [name, ...paramParts] = head.split(";");
    const params = paramParts.join(";");
    if (name === "EXDATE") {
      for (const v of value.split(",")) {
        const d = parseIcsDate(v, params);
        if (d) exdates[exdates.length - 1].add(d.date.getTime());
      }
      continue;
    }
    if (!(name in current)) current[name] = { value, params };
  }

  return events.sort((a, b) => a.start.localeCompare(b.start)).slice(0, 200);
}
