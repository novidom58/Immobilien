"use client";

import { useMemo, useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";

const MIN = 300_000;
const MAX = 3_000_000;
const STEP = 50_000;

function formatChf(value: number) {
  return `CHF ${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

export function ProvisionsRechner() {
  const [price, setPrice] = useState(1_200_000);

  const { classic, novidom, savings, percent } = useMemo(() => {
    const classicValue = price * 0.03;
    const novidomValue = price * 0.0095;
    return {
      classic: classicValue,
      novidom: novidomValue,
      savings: classicValue - novidomValue,
      percent: ((price - MIN) / (MAX - MIN)) * 100,
    };
  }, [price]);

  return (
    <section id="provisionsrechner" className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
        <Reveal>
          <div className="flex justify-center">
            <SectionLabel>Provisionsrechner</SectionLabel>
          </div>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
            Wie viel sparen Sie
            <br />
            mit <span className="text-amber-soft">NoviDom?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-lg text-ivory-dim">
            Verschieben Sie den Regler auf Ihren Verkaufspreis und sehen Sie
            sofort den Unterschied.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-xl">
            <div className="flex items-baseline justify-between font-mono text-sm text-ivory-dim">
              <span>Verkaufspreis</span>
              <span className="text-lg text-amber-soft">{formatChf(price)}</span>
            </div>
            <input
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-3 accent-amber"
              style={{
                background: `linear-gradient(to right, var(--color-amber) ${percent}%, var(--color-ink-3) ${percent}%)`,
              }}
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-ink-2 p-6">
                <div className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
                  Klassischer Makler (3%)
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-ivory-dim">
                  {formatChf(classic)}
                </div>
                <div className="mt-1 text-xs text-ivory-dim/50">Provision</div>
              </div>
              <div className="rounded-2xl border border-amber/40 bg-ink-2 p-6">
                <div className="font-mono text-xs uppercase tracking-wide text-amber">
                  NoviDom (0.95%)
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-amber-soft">
                  {formatChf(novidom)}
                </div>
                <div className="mt-1 text-xs text-ivory-dim/50">Provision</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border-l-2 border-amber bg-amber/10 px-7 py-6">
              <div className="font-mono text-xs uppercase tracking-wide text-amber">
                Ihre Ersparnis mit NoviDom
              </div>
              <div className="mt-1 font-display text-4xl font-semibold text-amber-soft">
                {formatChf(savings)}
              </div>
            </div>

            <a
              href="#kontakt"
              className="mt-8 inline-block rounded-full bg-amber px-8 py-4 font-display text-sm font-semibold uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
            >
              Jetzt Mandat anfragen →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
