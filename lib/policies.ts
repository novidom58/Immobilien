// Sparten für «Meine Versicherungen» im Kundenportal (Privatkunden). Für
// Firmenkunden kommen später eigene Sparten dazu (Betriebshaftpflicht,
// Sachversicherung, BVG, UVG, Krankentaggeld, Cyber).

export const SPARTEN = [
  { key: "haftpflicht", label: "Privathaftpflicht", hint: "Schäden, die Sie anderen verursachen", core: true },
  { key: "hausrat", label: "Hausrat", hint: "Ihre Einrichtung zum Neuwert", core: true },
  { key: "gebaeude", label: "Gebäude", hint: "Für Eigentümer: Wasser, Glas, Gebäudehaftpflicht", core: true },
  { key: "rechtsschutz", label: "Rechtsschutz", hint: "Streit mit Vermieter, Handwerkern, Nachbarn", core: true },
  { key: "motorfahrzeug", label: "Auto & Motorrad", hint: "Haftpflicht und Kasko", core: true },
  { key: "vorsorge", label: "Leben & Vorsorge (3a)", hint: "Todesfall, Erwerbsunfähigkeit, Säule 3a", core: true },
  { key: "reise", label: "Reise", hint: "Annullierung und Assistance", core: false },
  { key: "andere", label: "Andere", hint: "Tiere, Wertsachen, Bauherren", core: false },
] as const;

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
