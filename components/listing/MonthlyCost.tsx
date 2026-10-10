"use client";

import { useState } from "react";
import Link from "next/link";
import { chf, DEFAULT_RATE, monthlyOwnerCost } from "@/lib/ownership";
import { yearlyCosts } from "@/lib/finance";

/** «Was kostet mich das wirklich pro Monat?» für eine Objektseite. */
export function MonthlyCost({ price }: { price: number }) {
  const [equity, setEquity] = useState(20);
  const [rate, setRate] = useState(DEFAULT_RATE * 100);

  const cost = monthlyOwnerCost(price, equity / 100, rate / 100);
  // Banken rechnen mit 5% kalkulatorischem Zins: daraus das nötige Einkommen
  const bank = yearlyCosts(price, (price * equity) / 100);
  const neededIncome = Math.ceil(((bank.interest + bank.running + bank.amortisation) * 3) / 1000) * 1000;

  const rows = [
    { label: "Hypothekarzins", value: cost.interest },
    { label: "Amortisation (Sparen)", value: cost.amortisation },
    { label: "Unterhalt & Nebenkosten", value: cost.maintenance },
  ];

  return (
    <section className="mt-12 rounded-2xl border border-line bg-white p-6 lg:p-8">
      <h2 className="font-display text-2xl text-ivory">Was kostet es wirklich pro Monat?</h2>
      <p className="mt-1 text-sm text-ivory-dim">Mit {equity}% Eigenkapital und {rate.toFixed(1)}% Zins. Richtwerte, ohne Steuern.</p>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className="grid gap-5">
          <label className="block">
            <span className="flex justify-between text-sm text-ivory">
              Eigenkapital <span className="font-semibold">{equity}% · {chf((price * equity) / 100)}</span>
            </span>
            <input type="range" min={20} max={60} step={5} value={equity} onChange={(e) => setEquity(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-amber)]" />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm text-ivory">
              Hypothekarzins <span className="font-semibold">{rate.toFixed(1)}%</span>
            </span>
            <input type="range" min={0.8} max={3.5} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-amber)]" />
          </label>
        </div>

        <div>
          <dl className="grid gap-2 text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 text-ivory-dim">
                <dt>{r.label}</dt>
                <dd className="tabular-nums">{chf(r.value)}</dd>
              </div>
            ))}
            <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-line pt-3">
              <dt className="font-semibold text-ivory">Pro Monat</dt>
              <dd className="font-display text-3xl text-amber tabular-nums">{chf(cost.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-ivory-dim">
            Die Bank prüft mit 5% kalkulatorischem Zins. Dafür braucht es ein Haushaltseinkommen von etwa {chf(neededIncome)} pro Jahr.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/dashboard?preis=${price}#finanzierung`} className="rounded-full bg-night px-5 py-3 text-sm font-semibold text-ink hover:bg-amber">
          Meine Finanzierung prüfen
        </Link>
        <Link href="/leistungen/kaufen-verkaufen#mieten-kaufen" className="rounded-full border border-line px-5 py-3 text-sm text-ivory hover:border-ivory">
          Mieten oder kaufen?
        </Link>
      </div>
    </section>
  );
}
