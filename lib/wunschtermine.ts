// Drei Wunschtermine bei Besichtigungsanfragen: Format im Lead-Text und
// Auslesen im CRM (für die Rückfrage beim Eigentümer).

export const ZEITFENSTER = [
  { value: "vormittag", label: "Vormittag (9–12 Uhr)", kurz: "9–12 Uhr" },
  { value: "mittag", label: "Mittag (12–14 Uhr)", kurz: "12–14 Uhr" },
  { value: "nachmittag", label: "Nachmittag (14–17 Uhr)", kurz: "14–17 Uhr" },
  { value: "abend", label: "Abend (17–20 Uhr)", kurz: "17–20 Uhr" },
] as const;

const HEADER = "Wunschtermine:";

export function wunschText(address: string, termine: string[]) {
  return [`Besichtigungsanfrage für ${address}`, "", HEADER, ...termine.map((t, i) => `${i + 1}. ${t}`)].join("\n");
}

/** Liest die Wunschtermine aus dem Lead-Text (leer, wenn keine drin sind). */
export function parseWunschtermine(message: string | null | undefined) {
  if (!message || !message.includes(HEADER)) return [];
  return message
    .slice(message.indexOf(HEADER) + HEADER.length)
    .split("\n")
    .map((l) => l.match(/^\s*\d\.\s+(.+)$/)?.[1]?.trim())
    .filter((t): t is string => Boolean(t));
}

/** Vorlage für die Rückfrage beim Eigentümer (Mail oder WhatsApp). */
export function eigentuemerText(objekt: string, termine: string[]) {
  return [
    "Guten Tag",
    "",
    `Für «${objekt}» haben wir eine Besichtigungsanfrage. Die Interessenten könnten an diesen Terminen:`,
    "",
    ...termine.map((t, i) => `${i + 1}. ${t}`),
    "",
    "Passt Ihnen einer davon? Eine kurze Antwort mit der Nummer genügt.",
    "",
    "Freundliche Grüsse",
    "NoviDom Immobilien AG",
  ].join("\n");
}
