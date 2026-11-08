// Sparten für «Meine Versicherungen» im Kundenportal. Die KMU-Sparten
// erscheinen nur, wenn jemand eine Geschäftspolice erfasst (Inhaber/innen
// von kleinen Firmen haben so privat und geschäftlich alles an einem Ort).

export const SPARTEN = [
  { key: "haftpflicht", label: "Privathaftpflicht", hint: "Schäden, die Sie anderen verursachen", core: true, kmu: false },
  { key: "hausrat", label: "Hausrat", hint: "Ihre Einrichtung zum Neuwert", core: true, kmu: false },
  { key: "gebaeude", label: "Gebäude", hint: "Für Eigentümer: Feuer, Elementar, Wasser, Glas", core: true, kmu: false },
  { key: "rechtsschutz", label: "Rechtsschutz", hint: "Streit mit Vermieter, Handwerkern, Nachbarn", core: true, kmu: false },
  { key: "motorfahrzeug", label: "Auto & Motorrad", hint: "Haftpflicht und Kasko", core: true, kmu: false },
  { key: "vorsorge", label: "Leben & Vorsorge (3a)", hint: "Todesfall, Erwerbsunfähigkeit, Säule 3a", core: true, kmu: false },
  { key: "reise", label: "Reise", hint: "Annullierung und Assistance", core: false, kmu: false },
  { key: "andere", label: "Andere", hint: "Tiere, Wertsachen, Bauherren", core: false, kmu: false },
  { key: "betriebshaftpflicht", label: "Betriebshaftpflicht", hint: "Schäden, die Ihr Betrieb Dritten verursacht", core: false, kmu: true },
  { key: "sachversicherung", label: "Sach- & Betriebsunterbruch", hint: "Inventar, Waren, Geräte und Ertragsausfall", core: false, kmu: true },
  { key: "uvg_ktg", label: "Unfall (UVG) & Krankentaggeld", hint: "Lohnfortzahlung bei Unfall und Krankheit", core: false, kmu: true },
  { key: "bvg", label: "Pensionskasse (BVG)", hint: "Berufliche Vorsorge für Sie und Ihre Mitarbeitenden", core: false, kmu: true },
  { key: "cyber", label: "Cyber", hint: "Hackerangriff, Datenverlust, Erpressung", core: false, kmu: true },
] as const;

export const SPARTEN_PRIVAT = SPARTEN.filter((s) => !s.kmu);
export const SPARTEN_KMU = SPARTEN.filter((s) => s.kmu);
export const isKmuSparte = (key: string) => SPARTEN_KMU.some((s) => s.key === key);

export type SparteKey = (typeof SPARTEN)[number]["key"];

export type Policy = {
  id: string;
  sparte: string;
  versicherer: string | null;
  policennummer: string | null;
  praemie_jahr: number | null;
  ablauf: string | null;
  kuendigungsfrist_monate: number | null;
  deckung: string | null;
  storage_path: string | null;
  updated_at: string;
};

export const sparteLabel = (key: string) => SPARTEN.find((s) => s.key === key)?.label ?? key;

/** Letzter Tag, an dem noch gekündigt werden kann (Ablauf minus Kündigungsfrist). */
export function kuendigenBis(p: Pick<Policy, "ablauf" | "kuendigungsfrist_monate">) {
  if (!p.ablauf) return null;
  const d = new Date(`${p.ablauf}T12:00:00`);
  d.setMonth(d.getMonth() - (p.kuendigungsfrist_monate ?? 3));
  return d;
}
