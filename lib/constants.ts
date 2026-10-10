export const BERATER_OPTIONS = ["Ruedi", "Kim", "Gregy"] as const;

export const LEAD_SOURCE_OPTIONS = [
  "Website",
  "Instagram",
  "Facebook",
  "Homegate",
  "ImmoScout24",
  "Newsletter",
  "Empfehlung",
  "Akquise-E-Mail",
  "Sonstiges",
] as const;

export const PORTAL_OPTIONS = ["Homegate", "ImmoScout24", "Newhome", "ImmoStreet", "Comparis"] as const;

export const LEAD_STATUS_OPTIONS = [
  { value: "neu", label: "Neu" },
  { value: "kontaktiert", label: "Kontaktiert" },
  { value: "termin", label: "Termin vereinbart" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "irrelevant", label: "Irrelevant" },
] as const;

// Kundenrollen im CRM. Eine Person kann mehrere haben (z.B. Verkäufer und
// gleichzeitig Finanzierungskunde für das nächste Zuhause).
export const CUSTOMER_ROLES = [
  { value: "kaeufer", label: "Käufer" },
  { value: "verkaeufer", label: "Verkäufer" },
  { value: "interessent", label: "Interessent" },
  { value: "finanzierung", label: "Finanzierung" },
  { value: "versicherung", label: "Versicherung" },
  { value: "umbau", label: "Umbau" },
  { value: "mieter", label: "Mieter" },
  { value: "eigentuemer", label: "Eigentümer" },
] as const;

export type CustomerRole = (typeof CUSTOMER_ROLES)[number]["value"];

/** Rollen-Vorschlag aus einem Lead, nach Formular, Quelle und Nachricht. */
export function suggestRoles(lead: {
  type: string;
  source: string | null;
  message: string | null;
  wants_financing: boolean;
  listing_id: string | null;
}): CustomerRole[] {
  const roles = new Set<CustomerRole>();
  const source = (lead.source ?? "").toLowerCase();
  const message = (lead.message ?? "").toLowerCase();
  if (lead.type === "valuation" || source.includes("kaeufer-radar") || message.includes("bereich: kaufen & verkaufen")) roles.add("verkaeufer");
  if (lead.listing_id) roles.add("interessent");
  if (lead.wants_financing || source.includes("finanzierung") || message.includes("bereich: finanzieren")) roles.add("finanzierung");
  if (source.includes("versicherung") || message.includes("bereich: versichern")) roles.add("versicherung");
  if (message.includes("bereich: umbauen")) roles.add("umbau");
  if (roles.size === 0) roles.add("interessent");
  return [...roles];
}

export const SOCIAL_LINKS = [{ label: "Instagram", handle: "@novidom.immo", href: "https://www.instagram.com/novidom.immo/" }] as const;

