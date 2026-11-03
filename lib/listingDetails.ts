// Eckdaten eines Inserats, gespeichert als jsonb-Spalte listings.details.
// Alles optional: was leer bleibt, erscheint auf der Webseite nicht.

export type ListingDetails = {
  verfuegbar?: string;
  badezimmer?: string;
  etage?: string;
  baujahr?: string;
  renoviert?: string;
  grundstueck?: string;
  /** Nur bei verkauften Objekten: kurze Zeile auf der Referenz-Kachel */
  referenz?: string;
  /** Objekt-Film (scrollgesteuert), Link auf die MP4-Datei */
  film?: string;
  /** Grundriss für den Planer im Kundenportal (im CRM unter «Fotos & Titelbild» gesetzt) */
  grundriss?: { url: string; breite_m: number; ratio: number };
  highlights?: string[];
  merkmale?: string[];
};

export const DETAIL_FIELDS = [
  { key: "verfuegbar", label: "Verfügbar ab", placeholder: "z.B. sofort oder 1.4.2027" },
  { key: "badezimmer", label: "Badezimmer", placeholder: "z.B. 1" },
  { key: "etage", label: "Etage", placeholder: "z.B. EG" },
  { key: "baujahr", label: "Baujahr", placeholder: "z.B. 1965" },
  { key: "renoviert", label: "Letzte Renovation", placeholder: "z.B. 2025" },
  { key: "grundstueck", label: "Grundstücksfläche m²", placeholder: "z.B. 180" },
  { key: "film", label: "Objekt-Film (Link)", placeholder: "z.B. /videos/objektfilm/allschwil-1280.mp4" },
  { key: "referenz", label: "Referenz-Zeile (nur bei Verkauft)", placeholder: "z.B. 2024 · in 6 Wochen verkauft" },
] as const;

function clean(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function list(value: FormDataEntryValue | null, separator: RegExp) {
  return clean(value)
    .split(separator)
    .map((s) => s.replace(/^[\s·•\-*]+/, "").trim())
    .filter(Boolean);
}

export function readDetails(formData: FormData): ListingDetails {
  const details: ListingDetails = {};
  for (const f of DETAIL_FIELDS) {
    const v = clean(formData.get(`d_${f.key}`));
    if (v) details[f.key] = v;
  }
  const highlights = list(formData.get("d_highlights"), /\n/);
  const merkmale = list(formData.get("d_merkmale"), /[,\n]/);
  if (highlights.length) details.highlights = highlights;
  if (merkmale.length) details.merkmale = merkmale;
  return details;
}

export function asDetails(value: unknown): ListingDetails {
  return value && typeof value === "object" ? (value as ListingDetails) : {};
}
