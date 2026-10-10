"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { checkFinance, type FinanceInput } from "@/lib/finance";
import { saveFinanceCheck } from "@/app/dashboard/actions";

function chf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

// Anzeige mit Schweizer Tausender-Apostroph, gerechnet wird mit den Ziffern.
function format(value: string | number) {
  const digits = String(value).replace(/[^\d]/g, "");
  return digits ? Number(digits).toLocaleString("de-CH").replace(/[’,\s]/g, "'") : "";
}

function parse(value: string) {
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const field =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-ivory tabular-nums placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";
const label = "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ivory-dim";

const STATUS = {
  ok: { icon: CheckCircle2, text: "Finanzierung voraussichtlich möglich", tone: "border-emerald-600/30 bg-emerald-600/10 text-emerald-800" },
  knapp: { icon: AlertTriangle, text: "Knapp, mit Optimierung oft machbar", tone: "border-amber/40 bg-amber/10 text-amber" },
  nein: { icon: XCircle, text: "So noch nicht tragbar", tone: "border-red-600/30 bg-red-600/10 text-red-800" },
};

/**
 * Finanzierungs-Check im Kundenportal: Lohn, Vermögen, PK eingeben und
 * sofort sehen, ob ein Objekt tragbar ist, plus Tipps. Die verbindliche
 * Prüfung macht HypoCasa.
 */
export function FinanceCheck({
  initial,
  user,
  priceOptions,
}: {
  initial: Partial<FinanceInput> | null;
  user: { name: string; email: string };
  priceOptions: { label: string; price: number }[];
}) {
  const [income, setIncome] = useState(initial?.income ? format(initial.income) : "");
  const [savings, setSavings] = useState(initial?.savings ? format(initial.savings) : "");
  const [pension, setPension] = useState(initial?.pension ? format(initial.pension) : "");
  const [price, setPrice] = useState(initial?.price ? format(initial.price) : "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const input: FinanceInput = { income: parse(income), savings: parse(savings), pension: parse(pension), price: parse(price) };
  const result = checkFinance(input);

  async function handleSave() {
    setState("saving");
    const res = await saveFinanceCheck(input);
    if (res.error) {
      setError(res.error);
      setState("error");
    } else setState("saved");
  }

  async function handleRequest() {
    setState("sending");
    setError(null);
    await saveFinanceCheck(input);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        source: "portal-finanzierung",
        name: user.name,
        email: user.email,
        wantsFinancing: true,
        message: [
          "Finanzierungs-Check aus dem Kundenportal, bitte verbindlich prüfen (HypoCasa):",
          `Einkommen: ${chf(input.income)} / Jahr`,
          `Eigenmittel: ${chf(input.savings)} (+ PK ${chf(input.pension)})`,
          `Kaufpreis: ${input.price ? chf(input.price) : "offen"}`,
          `Ergebnis: ${result.status}, max. Preis ca. ${chf(result.maxPrice)}`,
        ].join("\n"),
      }),
    });
    if (res.ok) setState("sent");
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Senden fehlgeschlagen.");
      setState("error");
    }
  }

  const status = result.status !== "offen" ? STATUS[result.status] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid gap-4">
        <label>
          <span className={label}>Bruttoeinkommen Haushalt pro Jahr</span>
          <input inputMode="numeric" value={income} onChange={(e) => setIncome(format(e.target.value))} placeholder="z.B. 180'000" className={field} />
        </label>
        <label>
          <span className={label}>Erspartes, Wertschriften, Säule 3a</span>
          <input inputMode="numeric" value={savings} onChange={(e) => setSavings(format(e.target.value))} placeholder="z.B. 250'000" className={field} />
        </label>
        <label>
          <span className={label}>Geplanter Vorbezug Pensionskasse (optional)</span>
          <input inputMode="numeric" value={pension} onChange={(e) => setPension(format(e.target.value))} placeholder="z.B. 100'000" className={field} />
        </label>
        <label>
          <span className={label}>Kaufpreis</span>
          <input inputMode="numeric" value={price} onChange={(e) => setPrice(format(e.target.value))} placeholder="z.B. 1'250'000" className={field} />
        </label>
        {priceOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {priceOptions.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => setPrice(format(o.price))}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ivory hover:border-amber"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-white p-5" aria-live="polite">
        <div className={label}>Ihr maximaler Kaufpreis</div>
        <div className="font-display text-4xl text-ivory tabular-nums">{result.maxPrice ? chf(result.maxPrice) : "—"}</div>
        <p className="mt-1 text-xs text-ivory-dim">Nach den üblichen Regeln der Schweizer Banken. Richtwert, keine Zusage.</p>

        {status && (
          <div className={`mt-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${status.tone}`}>
            <status.icon className="h-4 w-4" strokeWidth={2} />
            {status.text}
          </div>
        )}
        {result.burden !== null && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="font-display text-xl text-ivory tabular-nums">{Math.round((result.equityRatio ?? 0) * 100)}%</div>
              <div className="text-xs text-ivory-dim">Eigenmittel (min. 20%)</div>
            </div>
            <div>
              <div className="font-display text-xl text-ivory tabular-nums">{Math.round(result.burden * 100)}%</div>
              <div className="text-xs text-ivory-dim">Tragbarkeit (max. 33%)</div>
            </div>
            <div>
              <div className="font-display text-xl text-ivory tabular-nums">{result.monthlyCost ? chf(result.monthlyCost) : "—"}</div>
              <div className="text-xs text-ivory-dim">kalkulatorisch / Monat</div>
            </div>
          </div>
        )}
        {result.tips.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm text-ivory-dim">
            {result.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                {tip}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRequest}
            disabled={state === "sending" || !input.income}
            className="rounded-full bg-night px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-amber disabled:opacity-50"
          >
            {state === "sending" ? "Wird gesendet …" : "Verbindlich prüfen lassen"}
          </button>
          <button type="button" onClick={handleSave} disabled={state === "saving"} className="text-sm text-ivory underline underline-offset-4">
            {state === "saving" ? "Speichert …" : "Werte speichern"}
          </button>
        </div>
        {state === "saved" && <p className="mt-3 text-sm text-emerald-700">Gespeichert.</p>}
        {state === "sent" && (
          <p className="mt-3 text-sm text-emerald-700">Danke! Unser Finanzierungspartner HypoCasa meldet sich innert 24 Stunden.</p>
        )}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
