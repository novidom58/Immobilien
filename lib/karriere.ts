// Leistungsstaffel für Berater/innen: Anteil an der Provision je nach
// Umsatz der letzten 12 Monate (rollend, inklusive des aktuellen Abschlusses).
//
// Zwei Wege zur nächsten Stufe, es zählt der bessere:
// - nur Immobilien-Provision (Verkäufe/Vermietungen aus «Abschluss & Provision»)
// - Gesamtumsatz: Immobilien plus bestätigte Versicherungs- und
//   Hypothekar-Erträge. Weil das mehr Quellen sind, liegen die Ziele höher.

export const STUFEN = [
  { nr: 1, titel: "Immobilienberater", anteil: 35, abImmo: 0, abGesamt: 0 },
  { nr: 2, titel: "Senior-Berater", anteil: 45, abImmo: 40_000, abGesamt: 50_000 },
  { nr: 3, titel: "Top-Berater", anteil: 50, abImmo: 80_000, abGesamt: 100_000 },
] as const;

/** Angestellte erhalten je Stufe so viele Prozentpunkte weniger als Freelancer. */
export const ANGESTELLT_ABZUG = 5;

/** Rechenbeispiel für «noch so viele Verkäufe»: CHF 900'000 zu 0,95 %. */
export const BEISPIEL_PREIS = 900_000;
export const BEISPIEL_SATZ = 0.95;
export const BEISPIEL_PROVISION = (BEISPIEL_PREIS * BEISPIEL_SATZ) / 100;

/** Vorschlag für den Ertrag einer Hypothek, wenn nur das Volumen bekannt ist. */
export const HYPO_ERTRAG_PCT = 0.3;

export type Anstellung = "freelancer" | "angestellt";

export type Posten = {
  id: string;
  art: "immobilie" | "versicherung" | "hypothek";
  titel: string;
  datum: string; // YYYY-MM-DD
  /** Umsatz für NoviDom (Provision, Courtage, Entschädigung) */
  umsatz: number;
  /** Verkaufspreis, Hypothekarvolumen oder Jahresprämie, nur zur Anzeige */
  volumen?: number | null;
};

const DAY = 24 * 3600 * 1000;
const t = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`).getTime();

export function stufeFuer(immo: number, gesamt: number) {
  let stufe: (typeof STUFEN)[number] = STUFEN[0];
  for (const s of STUFEN) if (immo >= s.abImmo || gesamt >= s.abGesamt) stufe = s;
  return stufe;
}

export function anteilFuer(stufe: (typeof STUFEN)[number], anstellung: Anstellung) {
  return stufe.anteil - (anstellung === "angestellt" ? ANGESTELLT_ABZUG : 0);
}

function summen(posten: Posten[], bis: number) {
  const fenster = posten.filter((p) => t(p.datum) <= bis && t(p.datum) > bis - 365 * DAY);
  const immo = fenster.filter((p) => p.art === "immobilie").reduce((s, p) => s + p.umsatz, 0);
  const gesamt = fenster.reduce((s, p) => s + p.umsatz, 0);
  return { immo, gesamt, fenster };
}

/**
 * Stand heute: Umsätze im 12-Monats-Fenster, Stufe, Anteil, Abstand zur
 * nächsten Stufe, Posten die bald aus dem Fenster fallen, und pro Posten der
 * Anteil, der beim Abschluss galt.
 */
export function karriereStand(posten: Posten[], anstellung: Anstellung, jetzt = Date.now()) {
  const sortiert = [...posten].sort((a, b) => t(a.datum) - t(b.datum));
  const { immo, gesamt, fenster } = summen(sortiert, jetzt);
  const stufe = stufeFuer(immo, gesamt);
  const naechste = STUFEN.find((s) => s.nr === stufe.nr + 1) ?? null;

  const fehltImmo = naechste ? Math.max(0, naechste.abImmo - immo) : 0;
  const fehltGesamt = naechste ? Math.max(0, naechste.abGesamt - gesamt) : 0;

  // Anteil pro Posten: Stufe zum Zeitpunkt des Abschlusses (inkl. diesem)
  const mitAnteil = fenster.map((p) => {
    const s = summen(sortiert, t(p.datum));
    const pct = anteilFuer(stufeFuer(s.immo, s.gesamt), anstellung);
    return { ...p, anteil: pct, betrag: (p.umsatz * pct) / 100 };
  });
  const verdient = mitAnteil.reduce((s, p) => s + p.betrag, 0);

  // Was in den nächsten 60 Tagen aus dem Fenster fällt
  const faelltWeg = fenster
    .map((p) => ({ ...p, ab: t(p.datum) + 365 * DAY }))
    .filter((p) => p.ab - jetzt <= 60 * DAY)
    .sort((a, b) => a.ab - b.ab);

  return {
    immo,
    gesamt,
    stufe,
    naechste,
    anteil: anteilFuer(stufe, anstellung),
    anteilNaechste: naechste ? anteilFuer(naechste, anstellung) : null,
    fehltImmo,
    fehltGesamt,
    verkaeufeBisNaechste: naechste ? Math.ceil(fehltImmo / BEISPIEL_PROVISION) : 0,
    posten: mitAnteil.reverse(),
    verdient,
    faelltWeg,
  };
}

/** Fest formatiert (Server und Browser gleich, sonst Hydration-Fehler). */
export const chf = (n: number) => `CHF ${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "’")}`;
