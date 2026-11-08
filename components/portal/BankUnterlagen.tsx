"use client";

import { useState } from "react";
import { DocChecklist } from "@/components/DocChecklist";
import { ERWERB_OPTIONS, OBJEKT_OPTIONS, VORHABEN_OPTIONS, bankUnterlagen, type Erwerb, type Objekt, type Vorhaben } from "@/lib/bankUnterlagen";

const select =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ivory focus:border-amber focus:outline-none";

/**
 * Unterlagen für die Bank: je nach Einkommen, Objekt und Vorhaben die
 * passende Liste, jeder Punkt direkt hochladbar.
 */
export function BankUnterlagen({ initialVorhaben = "kauf" }: { initialVorhaben?: Vorhaben }) {
  const [erwerb, setErwerb] = useState<Erwerb>("angestellt");
  const [objekt, setObjekt] = useState<Objekt>("normal");
  const [vorhaben, setVorhaben] = useState<Vorhaben>(initialVorhaben);
  const { personal, property } = bankUnterlagen({ erwerb, objekt, vorhaben });

  return (
    <div className="rounded-2xl border border-line bg-white p-5 lg:p-6">
      <div className="font-display text-lg text-ivory">Unterlagen für die Bank</div>
      <p className="mt-1 text-sm text-ivory-dim">Wählen Sie Ihre Situation, dann sehen Sie genau, was die Bank braucht. Jeden Punkt können Sie direkt hochladen.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-ivory-dim">
          Einkommen
          <select value={erwerb} onChange={(e) => setErwerb(e.target.value as Erwerb)} className={`${select} mt-1`}>
            {ERWERB_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ivory-dim">
          Objekt
          <select value={objekt} onChange={(e) => setObjekt(e.target.value as Objekt)} className={`${select} mt-1`}>
            {OBJEKT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ivory-dim">
          Vorhaben
          <select value={vorhaben} onChange={(e) => setVorhaben(e.target.value as Vorhaben)} className={`${select} mt-1`}>
            {VORHABEN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 grid gap-4 [&>*]:rounded-xl">
        <DocChecklist title="Persönliche Unterlagen" items={personal} />
        <DocChecklist title="Unterlagen zur Liegenschaft" items={property} />
      </div>
    </div>
  );
}
