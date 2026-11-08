"use client";

import { useState, useTransition } from "react";
import { addCustomerPolicy } from "@/app/admin/actions";
import { SPARTEN } from "@/lib/policies";

/** Police für den Kunden ins Portal legen (sieht er dann unter «Meine Versicherungen»). */
export function AdminPolicyForm({ customerId, onSaved }: { customerId: string; onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setOpen(true)}>
        + Police für den Kunden erfassen
      </button>
    );
  }

  return (
    <form
      action={(fd) =>
        start(async () => {
          setError(null);
          const res = await addCustomerPolicy(customerId, fd);
          if (res.error) setError(res.error);
          else {
            setDone(true);
            setOpen(false);
            onSaved?.();
          }
        })
      }
      style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", marginTop: 8 }}
    >
      <select name="sparte" className="field-select" defaultValue="haftpflicht" aria-label="Sparte">
        {SPARTEN.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <input name="versicherer" className="field-input" placeholder="Versicherer" />
      <input name="policennummer" className="field-input" placeholder="Policen-Nr." />
      <input name="praemie_jahr" className="field-input" placeholder="Prämie CHF / Jahr" inputMode="decimal" />
      <label style={{ fontSize: 11 }}>
        Ablauf
        <input name="ablauf" type="date" className="field-input" style={{ width: "100%" }} />
      </label>
      <select name="kuendigungsfrist_monate" className="field-select" defaultValue="3" aria-label="Kündigungsfrist">
        {[1, 2, 3, 6].map((m) => (
          <option key={m} value={m}>
            Kündigungsfrist {m} {m === 1 ? "Monat" : "Monate"}
          </option>
        ))}
      </select>
      <input name="deckung" className="field-input" placeholder="Deckung, z.B. Hausrat CHF 80'000, SB 200" style={{ gridColumn: "1 / -1" }} />
      <input name="file" type="file" accept="application/pdf,image/*" className="field-input" style={{ gridColumn: "1 / -1" }} />
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "Speichert …" : "Police speichern"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Abbrechen
        </button>
        {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
        {done && !error && <span style={{ fontSize: 12, color: "var(--green)" }}>Gespeichert</span>}
      </div>
    </form>
  );
}
