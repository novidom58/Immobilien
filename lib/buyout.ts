// Auskauf bei Trennung oder Scheidung: Kann eine Person das Haus allein
// übernehmen? Richtwerte nach den üblichen Bankregeln (Belehnung bis 80%,
// 5% kalkulatorischer Zins + 1% Nebenkosten + Amortisation ≤ 1/3 Einkommen).
// Güterrechtliche Fragen (Eigengut, PK-Vorbezüge) klärt der Anwalt.

export type BuyoutInput = {
  value: number; // Verkehrswert
  mortgage: number; // bestehende Hypothek
  partnerShare: number; // Anteil des Partners am Nettowert, z.B. 0.5
  income: number; // Bruttoeinkommen der übernehmenden Person pro Jahr
  ownFunds: number; // eigene Mittel, die die neue Hypothek senken
  rate: number; // effektiver Zins für die echte Monatsrate
};

export function buyout(input: BuyoutInput) {
  const net = Math.max(0, input.value - input.mortgage);
  const payout = net * input.partnerShare;
  const newMortgage = Math.max(0, input.mortgage + payout - input.ownFunds);
  const ltv = input.value > 0 ? newMortgage / input.value : 0;
  const amortisation = Math.max(0, newMortgage - (input.value * 2) / 3) / 15;
  const bankYearly = newMortgage * 0.05 + input.value * 0.01 + amortisation;
  const burden = input.income > 0 ? bankYearly / input.income : Infinity;
  const monthly = (newMortgage * input.rate + input.value * 0.01 + amortisation) / 12;
  const neededIncome = Math.ceil((bankYearly * 3) / 1000) * 1000;
  const ok = ltv <= 0.8 && burden <= 1 / 3;
  const close = !ok && ltv <= 0.85 && burden <= 0.38;
  return { net, payout, newMortgage, ltv, burden, monthly, neededIncome, status: ok ? "ok" : close ? "knapp" : "nein" } as const;
}
