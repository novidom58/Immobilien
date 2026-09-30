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
