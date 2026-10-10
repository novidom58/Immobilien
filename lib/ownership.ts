// Echte Wohnkosten von Eigentum und der Vergleich Mieten gegen Kaufen.
// Alles Richtwerte für die Beratung, keine Offerte. Steuern (Eigenmietwert,
// Abzüge) sind bewusst nicht eingerechnet.

export const DEFAULT_RATE = 0.015; // aktueller Mischzins (Annahme)
export const MAINTENANCE = 0.01; // Unterhalt und Nebenkosten pro Jahr, vom Kaufpreis
const FIRST_MORTGAGE = 2 / 3;
const AMORT_YEARS = 15;

export function monthlyOwnerCost(price: number, equityShare: number, rate = DEFAULT_RATE) {
  const mortgage = Math.max(0, price * (1 - equityShare));
  const interest = (mortgage * rate) / 12;
  const amortisation = Math.max(0, mortgage - price * FIRST_MORTGAGE) / AMORT_YEARS / 12;
  const maintenance = (price * MAINTENANCE) / 12;
  return { mortgage, interest, amortisation, maintenance, total: interest + amortisation + maintenance };
}

export type RentVsBuyInput = {
  price: number;
  equityShare: number; // z.B. 0.2
  rate: number; // Hypothekarzins
  rent: number; // vergleichbare Nettomiete pro Monat
  years: number;
  appreciation: number; // Wertsteigerung Immobilie p.a.
  rentIncrease: number; // Mietsteigerung p.a.
  investReturn: number; // Rendite auf angelegtes Geld p.a.
  buyingCosts: number; // Kaufnebenkosten (Notar, Grundbuch), Anteil vom Preis
};

export type RentVsBuyYear = { year: number; buyWealth: number; rentWealth: number; buyCost: number; rentCost: number };

/**
 * Faire Gegenüberstellung bei gleichem Budget: Wer mietet, legt Eigenkapital
 * und Kaufnebenkosten an. Wer pro Jahr weniger ausgibt, legt die Differenz an.
 * «Kosten» meint Geld, das weg ist: Zins, Unterhalt, Nebenkosten bzw. Miete.
 * Amortisation ist keine Ausgabe, sondern Sparen in die eigene Immobilie.
 */
export function rentVsBuy(input: RentVsBuyInput): RentVsBuyYear[] {
  const equity = input.price * input.equityShare;
  const upfront = equity + input.price * input.buyingCosts;
  let mortgage = input.price - equity;
  const amortPerYear = Math.max(0, mortgage - input.price * FIRST_MORTGAGE) / AMORT_YEARS;
  let amortLeft = Math.max(0, mortgage - input.price * FIRST_MORTGAGE);

  let rentDepot = upfront; // Mieter legt das Startkapital an
  let buyDepot = 0; // Käufer legt allfällige Ersparnis gegenüber Miete an
  let rentYearly = input.rent * 12;
  let buyCost = input.price * input.buyingCosts;
  let rentCost = 0;

  const rows: RentVsBuyYear[] = [{ year: 0, buyWealth: equity, rentWealth: upfront, buyCost, rentCost }];

  for (let y = 1; y <= input.years; y++) {
    const interest = mortgage * input.rate;
    const maintenance = input.price * Math.pow(1 + input.appreciation, y - 1) * MAINTENANCE;
    const amort = Math.min(amortPerYear, amortLeft);
    const buyOutflow = interest + maintenance + amort;

    rentDepot *= 1 + input.investReturn;
    buyDepot *= 1 + input.investReturn;
    if (buyOutflow > rentYearly) rentDepot += buyOutflow - rentYearly;
    else buyDepot += rentYearly - buyOutflow;

    buyCost += interest + maintenance;
    rentCost += rentYearly;
    mortgage -= amort;
    amortLeft -= amort;

    const value = input.price * Math.pow(1 + input.appreciation, y);
    rows.push({ year: y, buyWealth: value - mortgage + buyDepot, rentWealth: rentDepot, buyCost, rentCost });
    rentYearly *= 1 + input.rentIncrease;
  }
  return rows;
}

export function chf(value: number) {
  const sign = value < 0 ? "−" : "";
  return `${sign}CHF ${Math.round(Math.abs(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}
