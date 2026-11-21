// Provisionen: womit NoviDom Geld verdient und wie es intern aufgeteilt
// wird. Die Aufteilung ist festgelegt; die Ertragssätze sind Richtwerte und
// gelten nur, wenn im Vertrag mit Kunde oder Partner nichts anderes steht.
// Basis jeder Aufteilung ist der Betrag, der tatsächlich bei NoviDom eingeht.

import { BRINGER_ANTEIL, FIN_ANTEIL, STUFEN } from "@/lib/karriere";

/** Wer ein Objekt bringt (Akquise, Mandat), erhält diesen Anteil der Verkaufs-/Vermietungsprovision. */
export const BRINGER_IMMO_PCT = BRINGER_ANTEIL;
/** Wer eine Versicherung oder Finanzierung bringt, erhält diesen Anteil der Courtage bzw. Entschädigung. */
export const BRINGER_FIN_PCT = FIN_ANTEIL;

/** Spanne für den Verkäufer-Anteil aus der Leistungsstaffel (Karriere). */
export const VERKAEUFER_MIN = STUFEN[0].anteil;
export const VERKAEUFER_MAX = STUFEN[STUFEN.length - 1].anteil;

export type Quelle = {
  key: string;
  titel: string;
  ertrag: string;
  basis: string;
  aufteilung: "immo" | "fin" | "firma";
  hinweis?: string;
  festgelegt: boolean;
};

export const QUELLEN: Quelle[] = [
  {
    key: "verkauf",
    titel: "Verkauf einer Immobilie",
    ertrag: "ab 0.95 % des Verkaufspreises",
    basis: "Provision aus dem Verkaufsmandat, nur im Erfolgsfall",
    aufteilung: "immo",
    festgelegt: true,
  },
  {
    key: "vermietung",
    titel: "Vermietung",
    ertrag: "Richtwert: 1 Netto-Monatsmiete",
    basis: "Honorar aus dem Vermietungsmandat, nach Vertragsunterzeichnung",
    aufteilung: "immo",
    hinweis: "Satz bitte festlegen und im Mandat festhalten.",
    festgelegt: false,
  },
  {
    key: "suchmandat",
    titel: "Suchmandat für Käufer",
    ertrag: "Richtwert: Pauschale oder 1 % des Kaufpreises",
    basis: "Honorar vom Käufer, wenn wir für ihn suchen und verhandeln",
    aufteilung: "immo",
    hinweis: "Optional, Konditionen bitte festlegen.",
    festgelegt: false,
  },
  {
    key: "hypothek",
    titel: "Finanzierung (über HypoCasa)",
    ertrag: "Richtwert: ca. 0.3 % des Hypothekarvolumens",
    basis: "Entschädigung von Bank, Versicherung oder Pensionskasse bei Abschluss, auch bei Verlängerung und Aufstockung",
    aufteilung: "fin",
    hinweis: "Massgebend ist der Anteil, den HypoCasa an NoviDom auszahlt.",
    festgelegt: true,
  },
  {
    key: "versicherung",
    titel: "Versicherungen (über HypoCasa)",
    ertrag: "Courtage in % der Jahresprämie, je nach Sparte",
    basis: "Abschlusscourtage beim neuen Vertrag und jährliche Bestandescourtage, solange der Vertrag läuft",
    aufteilung: "fin",
    hinweis: "Gleiche Aufteilung für Privat- und KMU-Policen. Sätze laut Courtagevereinbarung.",
    festgelegt: true,
  },
  {
    key: "umbau",
    titel: "Umbau und Bauleitung",
    ertrag: "Richtwert: Honorar in % der Bausumme",
    basis: "Planung und Bauleitung durch unsere Bauabteilung",
    aufteilung: "firma",
    hinweis: "Aufteilung noch offen, bitte festlegen.",
    festgelegt: false,
  },
  {
    key: "bewertung",
    titel: "Bewertung auf Auftrag",
    ertrag: "Richtwert: Pauschale pro Gutachten",
    basis: "Verkehrswertschätzung für Bank, Erbteilung oder Trennung, wenn kein Verkauf folgt",
    aufteilung: "firma",
    hinweis: "Die Bewertung vor einem Verkauf bleibt kostenlos.",
    festgelegt: false,
  },
  {
    key: "partner",
    titel: "Empfehlungen an Partner",
    ertrag: "Tippgeber-Provision nach Vereinbarung",
    basis: "Zum Beispiel Umzug, Reinigung oder Handwerker, die wir vermitteln",
    aufteilung: "fin",
    hinweis: "Nur mit schriftlicher Vereinbarung und offen gegenüber dem Kunden.",
    festgelegt: false,
  },
];

export type Split = { bringer: number; verkaeufer: number; firma: number };

/** Aufteilung eines Betrags (in CHF) nach Art und Verkäufer-Anteil in %. */
export function aufteilen(betrag: number, art: Quelle["aufteilung"], verkaeuferPct: number): Split {
  if (art === "fin") {
    const bringer = (betrag * BRINGER_FIN_PCT) / 100;
    return { bringer, verkaeufer: 0, firma: betrag - bringer };
  }
  if (art === "immo") {
    const bringer = (betrag * BRINGER_IMMO_PCT) / 100;
    const verkaeufer = (betrag * verkaeuferPct) / 100;
    return { bringer, verkaeufer, firma: betrag - bringer - verkaeufer };
  }
  return { bringer: 0, verkaeufer: 0, firma: betrag };
}
