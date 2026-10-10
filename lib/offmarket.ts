// Off-Market-Vorverkauf: neue Objekte sehen zuerst nur angemeldete Käufer.
export const OFFMARKET_HOURS = 48;

/** PostgREST-Filter für öffentliche Listen: nur Objekte ohne laufende Off-Market-Phase. */
export function publicListingFilter() {
  return `offmarket_until.is.null,offmarket_until.lt.${new Date().toISOString()}`;
}

/** Verbleibende Stunden der Off-Market-Phase oder null, wenn keine läuft. */
export function offmarketHoursLeft(until: string | null | undefined) {
  if (!until) return null;
  const ms = new Date(until).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 3_600_000) : null;
}
