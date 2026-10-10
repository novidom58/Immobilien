export type ViewingFeedback = {
  id: string;
  listing_id: string;
  name: string | null;
  rating: number | null;
  preis: "zu_tief" | "passt" | "zu_hoch" | null;
  interesse: "ja" | "vielleicht" | "nein" | null;
  positiv: string | null;
  negativ: string | null;
  kanal: string | null;
  created_at: string;
};

export const PREIS_LABEL = { zu_tief: "eher tief", passt: "passend", zu_hoch: "eher hoch" } as const;
export const INTERESSE_LABEL = { ja: "Ja", vielleicht: "Vielleicht", nein: "Nein" } as const;

/** Zusammenfassung für Verkäufer und Team. */
export function summarizeFeedback(items: ViewingFeedback[]) {
  const rated = items.filter((f) => f.rating);
  const count = (key: "preis" | "interesse", value: string) => items.filter((f) => f[key] === value).length;
  return {
    total: items.length,
    avg: rated.length ? rated.reduce((s, f) => s + (f.rating ?? 0), 0) / rated.length : null,
    preis: { zu_tief: count("preis", "zu_tief"), passt: count("preis", "passt"), zu_hoch: count("preis", "zu_hoch") },
    interesse: { ja: count("interesse", "ja"), vielleicht: count("interesse", "vielleicht"), nein: count("interesse", "nein") },
  };
}
