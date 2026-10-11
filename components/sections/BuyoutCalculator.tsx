"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { buyout } from "@/lib/buyout";
import { chf } from "@/lib/ownership";

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3 text-sm text-ivory">
        {label}
        <span className="font-semibold tabular-nums">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-amber)]" />
    </label>
  );
}

const STATUS = {
  ok: { icon: CheckCircle2, text: "Übernahme voraussichtlich finanzierbar", tone: "border-emerald-600/30 bg-emerald-600/10 text-emerald-800" },
  knapp: { icon: AlertTriangle, text: "Knapp, mit mehr Eigenmitteln oft machbar", tone: "border-amber/40 bg-amber/10 text-amber" },
  nein: { icon: XCircle, text: "So allein noch nicht tragbar", tone: "border-red-600/30 bg-red-600/10 text-red-800" },
} as const;

/** Kann eine Person das Haus übernehmen und den Partner auszahlen? */
export function BuyoutCalculator() {
  const [value, setValue] = useState(1_200_000);
  const [mortgage, setMortgage] = useState(650_000);
  const [share, setShare] = useState(50);
  const [income, setIncome] = useState(160_000);
  const [ownFunds, setOwnFunds] = useState(0);

  const safeMortgage = Math.min(mortgage, value);
  const r = buyout({ value, mortgage: safeMortgage, partnerShare: share / 100, income, ownFunds, rate: 0.015 });
  const status = STATUS[r.status];

  return (
    <div className="grid gap-8 rounded-[28px] border border-line bg-white p-6 shadow-[0_15px_70px_rgba(61,53,34,0.06)] lg:grid-cols-[1fr_1fr] lg:p-10">
      <div className="grid content-start gap-5">
        <Slider label="Wert des Hauses" value={value} display={chf(value)} min={300_000} max={4_000_000} step={25_000} onChange={setValue} />
        <Slider label="Bestehende Hypothek" value={safeMortgage} display={chf(safeMortgage)} min={0} max={value} step={10_000} onChange={setMortgage} />
        <Slider label="Anteil des Partners am Nettowert" value={share} display={`${share}%`} min={0} max={100} step={5} onChange={setShare} />
        <Slider label="Ihr Einkommen pro Jahr (brutto)" value={income} display={chf(income)} min={40_000} max={500_000} step={5_000} onChange={setIncome} />
        <Slider label="Eigene Mittel für den Auskauf" value={ownFunds} display={chf(ownFunds)} min={0} max={1_000_000} step={10_000} onChange={setOwnFunds} />
        <p className="text-xs leading-relaxed text-ivory-dim">
          Der Anteil hängt vom Güterstand, von Eigengut und von Pensionskassen-Vorbezügen ab. Das klärt Ihr Anwalt oder die Mediation; wir rechnen mit
          dem Ergebnis.
        </p>
      </div>

      <div aria-live="polite">
        <div className="text-sm text-ivory-dim">Auszahlung an den Partner</div>
        <div className="font-display text-4xl text-ivory tabular-nums">{chf(r.payout)}</div>
        <div className="mt-1 text-xs text-ivory-dim">Nettowert {chf(r.net)} (Wert minus Hypothek)</div>

        <div className={`mt-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${status.tone}`}>
          <status.icon className="h-4 w-4" strokeWidth={2} />
          {status.text}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-ink-2 p-3">
            <dt className="text-xs text-ivory-dim">Neue Hypothek</dt>
            <dd className="font-display text-xl text-ivory tabular-nums">{chf(r.newMortgage)}</dd>
          </div>
          <div className="rounded-xl bg-ink-2 p-3">
            <dt className="text-xs text-ivory-dim">Belehnung (max. 80%)</dt>
            <dd className="font-display text-xl text-ivory tabular-nums">{Math.round(r.ltv * 100)}%</dd>
          </div>
          <div className="rounded-xl bg-ink-2 p-3">
            <dt className="text-xs text-ivory-dim">Tragbarkeit (max. 33%)</dt>
            <dd className="font-display text-xl text-ivory tabular-nums">{Number.isFinite(r.burden) ? `${Math.round(r.burden * 100)}%` : "—"}</dd>
          </div>
          <div className="rounded-xl bg-ink-2 p-3">
            <dt className="text-xs text-ivory-dim">Echte Kosten / Monat</dt>
            <dd className="font-display text-xl text-ivory tabular-nums">{chf(r.monthly)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-ivory-dim">
          Für die Übernahme braucht es nach Bankregeln ein Einkommen von etwa {chf(r.neededIncome)} pro Jahr. Echte Kosten mit 1.5% Zins, 1%
          Unterhalt und Amortisation. Richtwerte, keine Zusage.
        </p>
      </div>
    </div>
  );
}
