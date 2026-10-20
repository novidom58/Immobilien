"use client";

import { useActionState } from "react";
import { saveZinssaetze } from "@/app/admin/actions";

type Rate = { laufzeit: string; zins: number; updated_at: string };

const FIELDS = [
  { key: "saron", label: "SARON" },
  { key: "3", label: "Fest 3 J." },
  { key: "5", label: "Fest 5 J." },
  { key: "7", label: "Fest 7 J." },
  { key: "10", label: "Fest 10 J." },
];

/** Richtzinsen fürs öffentliche Zinsbarometer auf /leistungen/finanzieren. */
export function ZinsEditor({ rates }: { rates: Rate[] }) {
  const [state, formAction, pending] = useActionState(
    async (_: { error: string | null; saved?: number } | null, formData: FormData) => saveZinssaetze(formData),
    null
  );
  const byKey = new Map(rates.map((r) => [r.laufzeit, r]));
  const stand = rates.length ? new Date(rates.map((r) => r.updated_at).sort().at(-1) as string).toLocaleDateString("de-CH") : null;

  return (
    <form action={formAction} className="card" >
      <div className="card-header">
        <div>
          <div className="card-title">Zinsbarometer</div>
          <div className="card-sub">Richtzinsen in %, erscheinen auf der Finanzieren-Seite{stand ? ` · Stand ${stand}` : ""}. Einmal pro Woche aktualisieren.</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, padding: "16px 20px 20px" }}>
        {FIELDS.map((f) => (
          <label key={f.key} className="field-group">
            <span className="field-label">{f.label}</span>
            <input name={f.key} inputMode="decimal" defaultValue={byKey.get(f.key)?.zins ?? ""} placeholder="z. B. 1.35" className="field-input" />
          </label>
        ))}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Speichert…" : "Speichern"}
          </button>
        </div>
      </div>
      {state?.error && <p style={{ fontSize: 13, color: "var(--red)", padding: "0 20px 16px" }}>{state.error}</p>}
      {state && !state.error && <p style={{ fontSize: 13, color: "var(--green)", padding: "0 20px 16px" }}>{state.saved ? `${state.saved} Zinssatz/-sätze gespeichert.` : "Keine Änderung."}</p>}
    </form>
  );
}
