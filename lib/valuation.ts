export const VALUATION_REGIONS = ["Basel-Stadt", "Basel-Landschaft", "Solothurn", "Andere"] as const;
export type ValuationRegion = (typeof VALUATION_REGIONS)[number];

export const VALUATION_TYPES = ["Haus", "Wohnung", "Stockwerkeigentum"] as const;
export type ValuationType = (typeof VALUATION_TYPES)[number];

// Grobe Ø-Marktpreise (CHF pro m² Wohnfläche), Region Basel — dient nur als
// Richtwert-Heuristik für den Sofort-Rechner, keine echte AVM-Bewertung.
const PRICE_PER_SQM: Record<ValuationRegion, Record<ValuationType, number>> = {
  "Basel-Stadt": { Haus: 9500, Wohnung: 11000, Stockwerkeigentum: 10500 },
  "Basel-Landschaft": { Haus: 7800, Wohnung: 8500, Stockwerkeigentum: 8200 },
  Solothurn: { Haus: 6000, Wohnung: 6500, Stockwerkeigentum: 6300 },
  Andere: { Haus: 7500, Wohnung: 8000, Stockwerkeigentum: 7800 },
};

export function estimateValue(region: ValuationRegion, type: ValuationType, livingArea: number) {
  const perSqm = PRICE_PER_SQM[region][type];
  const mid = Math.round(perSqm * livingArea);
  return {
    low: Math.round((mid * 0.85) / 1000) * 1000,
    mid,
    high: Math.round((mid * 1.15) / 1000) * 1000,
  };
}

export function formatChf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}
