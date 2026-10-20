// Verkauf oder Vermietung: Bezeichnungen und Preisformat an einem Ort.
// offer_type fehlt vor dem SQL-Update, dann gilt «kauf».

export type OfferType = "kauf" | "miete";

export function offerTypeOf(value: unknown): OfferType {
  return value === "miete" ? "miete" : "kauf";
}

export function formatChf(value: number) {
  return `CHF ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

export function priceText(price: number | null, offer: OfferType, fallback = "Preis auf Anfrage") {
  if (!price) return fallback;
  return offer === "miete" ? `${formatChf(price)} / Mt.` : formatChf(price);
}

const STATUS = {
  active: { kauf: "Zum Verkauf", miete: "Zu vermieten", classes: "border-amber/50 text-amber-soft" },
  reserved: { kauf: "Reserviert", miete: "Reserviert", classes: "border-blueprint/50 text-blueprint" },
  sold: { kauf: "Verkauft", miete: "Vermietet", classes: "border-line text-ivory-dim/60" },
} as const;

export function statusBadge(status: string, offer: OfferType) {
  const s = STATUS[status as keyof typeof STATUS] ?? STATUS.active;
  return { label: s[offer], classes: s.classes };
}
