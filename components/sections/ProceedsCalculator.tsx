"use client";

import { useMemo, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const COMMISSION_RATE = 0.0095;

function formatChf(value: number) {
  // Intl.NumberFormat("de-CH") can pick a different thousands-separator
  // glyph between Node's ICU (SSR) and the browser (CSR), which trips a
  // hydration mismatch. Format manually so the output is byte-identical.
  const rounded = Math.max(0, Math.round(value));
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `CHF ${grouped}`;
}

function parseInput(raw: string) {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function ProceedsCalculator() {
  const [priceRaw, setPriceRaw] = useState("1'200'000");
  const [debtRaw, setDebtRaw] = useState("650'000");

  const price = parseInput(priceRaw);
  const debt = parseInput(debtRaw);

  const { commission, netProceeds } = useMemo(() => {
    const commissionValue = price * COMMISSION_RATE;
    return {
      commission: commissionValue,
      netProceeds: price - commissionValue - debt,
    };
  }, [price, debt]);

  return (
    <section className="relative bg-ink-2 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Ihr Rechner</SectionLabel>

        <div className="mt-10 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Was bleibt Ihnen
              <br />
              <span className="text-amber-soft">nach dem Verkauf?</span>
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
              Verkaufspreis und Restschuld eingeben — wir rechnen Ihren
              geschätzten Nettoerlös nach unserer fixen 0.95%-Kommission
              sofort aus.
            </p>
            <p className="mt-4 max-w-md text-sm text-ivory-dim/60">
              Notarkosten, Handänderungssteuer und eine allfällige
              Grundstückgewinnsteuer sind hier nicht eingerechnet — diese
              besprechen wir im persönlichen Gespräch.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-line bg-ink p-6 lg:p-8">
              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
                    Verkaufspreis (CHF)
                  </span>
                  <input
                    inputMode="numeric"
                    value={priceRaw}
                    onChange={(e) => setPriceRaw(e.target.value)}
                    onBlur={() => setPriceRaw(price.toLocaleString("de-CH"))}
                    className="rounded-xl border border-line bg-ink-2 px-4 py-3 font-mono text-lg text-ivory focus:border-amber focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
                    Restschuld / Hypothek (CHF)
                  </span>
                  <input
                    inputMode="numeric"
                    value={debtRaw}
                    onChange={(e) => setDebtRaw(e.target.value)}
                    onBlur={() => setDebtRaw(debt.toLocaleString("de-CH"))}
                    className="rounded-xl border border-line bg-ink-2 px-4 py-3 font-mono text-lg text-ivory focus:border-amber focus:outline-none"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-2 border-t border-line pt-6 text-sm">
                <div className="flex items-baseline justify-between text-ivory-dim">
                  <span>NoviDom Kommission (0.95%)</span>
                  <span className="font-mono text-ivory">− {formatChf(commission)}</span>
                </div>
                <div className="flex items-baseline justify-between text-ivory-dim">
                  <span>Restschuld</span>
                  <span className="font-mono text-ivory">− {formatChf(debt)}</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border-l-2 border-amber bg-amber/10 px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs uppercase tracking-wide text-amber">
                    Geschätzter Nettoerlös
                  </span>
                  <span className="font-display text-3xl font-semibold text-amber-soft">
                    {formatChf(netProceeds)}
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
