"use client";

import { motion } from "motion/react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Counter } from "@/components/ui/Counter";

const rows = [
  { label: "Klassische Maklerprovision", value: 3, width: "100%", tone: "bg-ivory-dim/30" },
  { label: "NoviDom Fixkommission", value: 0.95, width: "31.6%", tone: "bg-amber" },
];

export function CommissionCompare() {
  return (
    <section id="kommission" className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Fair &amp; transparent</SectionLabel>

        <div className="mt-10 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Eine faire Kommission.
              <br />
              <span className="text-amber-soft">Ohne versteckte Kosten.</span>
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
              Bei einem Verkaufspreis von CHF 1&apos;200&apos;000 sparen Sie mit
              NoviDom gegenüber einer klassischen 3%-Provision rund{" "}
              <span className="font-mono text-amber-soft">CHF 24&apos;600</span>.
            </p>

            <div className="mt-10 flex items-baseline gap-2">
              <Counter to={0.95} decimals={2} suffix="%" className="font-display text-6xl font-semibold text-amber" />
              <span className="font-sans text-ivory-dim">Fixkommission</span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-8">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-baseline justify-between font-sans text-sm text-ivory-dim">
                  <span>{row.label}</span>
                  <span className="font-mono text-ivory">{row.value}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-ink-3">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: row.width, transformOrigin: "left" }}
                    className={`h-full rounded-full ${row.tone}`}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-xl border-l-2 border-amber bg-amber/10 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-wide text-amber">
                  Ihre Ersparnis
                </span>
                <span className="font-display text-3xl font-semibold text-amber-soft">
                  CHF 24&apos;600
                </span>
              </div>
              <p className="mt-2 text-xs text-ivory-dim/70">
                Beispiel: Verkaufspreis CHF 1.2 Mio. — CHF 36&apos;000 (3%) statt
                CHF 11&apos;400 (0.95%) · 100% erfolgsbasiert
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
