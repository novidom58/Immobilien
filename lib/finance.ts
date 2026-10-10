// Tragbarkeit nach den üblichen Regeln der Schweizer Banken (Richtwerte,
// keine Zusage): mind. 20% Eigenmittel, davon mind. 10% «hart» (nicht aus
// der Pensionskasse); Belehnung bis 80%, die 2. Hypothek über 2/3 hinaus wird
// in 15 Jahren amortisiert; Wohnkosten mit 5% kalkulatorischem Zins plus 1%
// Nebenkosten plus Amortisation höchstens ein Drittel des Bruttoeinkommens.

export type FinanceInput = {
  income: number; // Bruttoeinkommen pro Jahr (Haushalt)
  savings: number; // harte Eigenmittel: Erspartes, Wertschriften, 3a
  pension: number; // geplanter PK-Vorbezug
  price: number; // Kaufpreis des Objekts (0 = nur maximalen Preis rechnen)
};

const CALC_RATE = 0.05;
const RUNNING_COSTS = 0.01;
const FIRST_MORTGAGE = 2 / 3;
const MAX_LTV = 0.8;
const AMORT_YEARS = 15;
const MAX_BURDEN = 1 / 3;

export function yearlyCosts(price: number, equity: number) {
  const mortgage = Math.max(0, price - equity);
  const amortisation = Math.max(0, mortgage - price * FIRST_MORTGAGE) / AMORT_YEARS;
  return { mortgage, interest: mortgage * CALC_RATE, running: price * RUNNING_COSTS, amortisation };
}

function feasible(price: number, input: FinanceInput) {
  const equity = input.savings + input.pension;
  if (equity < price * (1 - MAX_LTV)) return false;
  if (input.savings < price * 0.1) return false;
  const c = yearlyCosts(price, equity);
  return c.interest + c.running + c.amortisation <= input.income * MAX_BURDEN;
}

/** Höchster Kaufpreis, der alle Regeln erfüllt (auf CHF 5'000 gerundet). */
export function maxPrice(input: FinanceInput) {
  if (input.income <= 0 || input.savings <= 0) return 0;
  let lo = 0;
  let hi = 20_000_000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (feasible(mid, input)) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo / 5000) * 5000;
}

export type FinanceResult = {
  maxPrice: number;
  equity: number;
  equityRatio: number | null;
  hardRatio: number | null;
  burden: number | null; // Anteil der Wohnkosten am Einkommen
  monthlyCost: number | null;
  status: "ok" | "knapp" | "nein" | "offen";
  tips: string[];
};

function chf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

export function checkFinance(input: FinanceInput): FinanceResult {
  const equity = input.savings + input.pension;
  const max = maxPrice(input);
  const tips: string[] = [];

  if (!input.price) {
    return { maxPrice: max, equity, equityRatio: null, hardRatio: null, burden: null, monthlyCost: null, status: "offen", tips };
  }

  const c = yearlyCosts(input.price, equity);
  const burden = input.income > 0 ? (c.interest + c.running + c.amortisation) / input.income : null;
  const equityRatio = equity / input.price;
  const hardRatio = input.savings / input.price;

  if (equityRatio < 0.2) {
    tips.push(`Es fehlen rund ${chf(input.price * 0.2 - equity)} Eigenmittel für die nötigen 20%. Möglich sind z.B. ein Erbvorbezug, eine Schenkung oder Säule-3a-Guthaben.`);
  }
  if (hardRatio < 0.1) {
    tips.push(`Mindestens 10% (${chf(input.price * 0.1)}) müssen aus Erspartem, Wertschriften oder der Säule 3a stammen, nicht aus der Pensionskasse.`);
  }
  if (burden !== null && burden > MAX_BURDEN) {
    const neededIncome = (c.interest + c.running + c.amortisation) / MAX_BURDEN;
    tips.push(`Die Banken rechnen mit ${Math.round(burden * 100)}% Ihres Einkommens, erlaubt sind etwa 33%. Mit rund ${chf(Math.ceil(neededIncome / 1000) * 1000)} Haushaltseinkommen oder mehr Eigenmitteln geht es auf.`);
  }
  if (input.pension > 0) {
    tips.push("Ein PK-Vorbezug senkt später die Rente. Eine Verpfändung statt eines Bezugs kann eine Alternative sein. Wir rechnen beides durch.");
  }
  if (equityRatio >= 0.2 && burden !== null && burden <= MAX_BURDEN && c.amortisation > 0) {
    tips.push("Die indirekte Amortisation über die Säule 3a spart oft Steuern. Lohnt sich ein Vergleich.");
  }
  if (max > input.price * 1.1) {
    tips.push(`Ihr Spielraum reicht bis etwa ${chf(max)}. Gut für Verhandlungen oder einen späteren Umbau.`);
  }

  const ok = equityRatio >= 0.2 && hardRatio >= 0.1 && burden !== null && burden <= MAX_BURDEN;
  const close = !ok && burden !== null && burden <= 0.38 && equityRatio >= 0.17 && hardRatio >= 0.08;
  return {
    maxPrice: max,
    equity,
    equityRatio,
    hardRatio,
    burden,
    monthlyCost: (c.interest + c.running + c.amortisation) / 12,
    status: ok ? "ok" : close ? "knapp" : "nein",
    tips,
  };
}
