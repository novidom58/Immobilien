// Koordinaten sind auf Strassenebene geschätzt (Kartenmarker), nicht vermessen.
export const OFFICES = [
  {
    city: "Basel",
    label: "Basel · Büro",
    street: "Güterstrasse 140",
    postalCode: "4053",
    lat: 47.5441,
    lng: 7.5937,
  },
  {
    city: "Zug",
    label: "Zug · Büro",
    street: "Gotthardstrasse 30",
    postalCode: "6300",
    lat: 47.1736,
    lng: 8.5146,
  },
] as const;

export type Office = (typeof OFFICES)[number];

export function officeAddress(office: Office) {
  return `${office.street}, ${office.postalCode} ${office.city}`;
}
