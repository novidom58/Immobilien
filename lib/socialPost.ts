// Social-Media-Beiträge direkt aus einem Inserat: Bildvorlagen (siehe
// /api/social/[id]) und ein fertiger Text mit Hashtags. So entsteht für jedes
// neue Objekt in einer Minute ein Instagram-Beitrag, ohne Grafikprogramm.

import { formatChf, type OfferType } from "@/lib/listingOffer";

export type SocialListing = {
  id: string;
  title: string | null;
  city: string;
  property_type: string;
  offer_type: OfferType;
  status: string;
  price_chf: number | null;
  rooms: number | null;
  living_area: number | null;
  details?: { highlights?: string[] } | null;
};

export const SOCIAL_VORLAGEN = [
  { key: "neu", label: "Neu im Angebot", hinweis: "Foto gross, unten Eckdaten. Für den ersten Beitrag." },
  { key: "fakten", label: "Eckdaten", hinweis: "Foto oben, Zahlen unten. Gut als 2. Bild im Karussell." },
  { key: "status", label: "Reserviert / Verkauft", hinweis: "Für den Abschluss-Beitrag." },
  { key: "story", label: "Story 9:16", hinweis: "Für Instagram- und WhatsApp-Status." },
] as const;

export type SocialVorlage = (typeof SOCIAL_VORLAGEN)[number]["key"];

/** «4.5-Zimmer-Wohnung», sonst der Inserate-Titel oder die Objektart. */
export function objektName(l: SocialListing) {
  if (l.rooms) return `${l.rooms}-Zimmer-${l.property_type}`;
  return l.title || l.property_type;
}

export function faktenZeile(l: SocialListing) {
  return [l.rooms ? `${l.rooms} Zimmer` : null, l.living_area ? `${l.living_area} m²` : null, l.city].filter(Boolean).join(" · ");
}

export function preisZeile(l: SocialListing) {
  if (!l.price_chf) return "Preis auf Anfrage";
  return l.offer_type === "miete" ? `${formatChf(l.price_chf)} / Monat` : formatChf(l.price_chf);
}

const tag = (s: string) => `#${s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "")}`;

/** Fertiger Beitragstext für Instagram und Facebook, je nach Vorlage. */
export function socialCaption(l: SocialListing, vorlage: SocialVorlage, link: string) {
  const name = objektName(l);
  const miete = l.offer_type === "miete";
  const highlights = (l.details?.highlights ?? []).slice(0, 3);
  const tags = [
    "#NoviDom",
    tag(l.city),
    miete ? "#WohnungMieten" : "#ImmobilienKaufen",
    tag(l.property_type),
    "#ImmobilienSchweiz",
    "#Nordwestschweiz",
  ].join(" ");

  if (vorlage === "status") {
    const verkauft = l.status === "sold";
    return [
      verkauft ? `${miete ? "Vermietet" : "Verkauft"} 🔑 ${name} in ${l.city}.` : `Reserviert ✨ ${name} in ${l.city}.`,
      verkauft
        ? "Danke an die Eigentümer für das Vertrauen. Wir freuen uns mit den neuen Bewohnern."
        : "Schon reserviert. Sie suchen etwas Ähnliches? Mit dem Käufer-Alarm erfahren Sie neue Objekte zuerst.",
      "",
      "Sie überlegen zu verkaufen? Die Bewertung ist kostenlos, der Link ist in der Bio.",
      "",
      tags,
    ].join("\n");
  }

  return [
    `${vorlage === "neu" || vorlage === "story" ? "Neu bei uns: " : ""}${name} in ${l.city} 🏡`,
    "",
    faktenZeile(l) + (l.price_chf ? ` · ${preisZeile(l)}` : ""),
    ...(highlights.length ? ["", ...highlights.map((h) => `✓ ${h}`)] : []),
    "",
    `Alle Fotos, Grundriss und Besichtigung: ${link}`,
    "Oder direkt per Nachricht an uns.",
    "",
    tags,
  ].join("\n");
}
