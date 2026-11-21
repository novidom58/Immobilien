"use client";

import { useState, useTransition } from "react";
import { mergeCustomers } from "@/app/admin/actions";

type Kunde = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  berater: string | null;
  created_at: string;
  rollen: string[];
  quelle: string | null;
  activity: unknown[];
};

const datum = (d: string) => new Date(d).toLocaleDateString("de-CH");

/** Eine Gruppe möglicher Doppelter: wählen, wer bleibt, dann zusammenführen. */
export function MergeGroup({ grund, kunden }: { grund: string; kunden: Kunde[] }) {
  const [keep, setKeep] = useState(kunden[0].id);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function merge() {
    const others = kunden.filter((k) => k.id !== keep);
    const keepName = kunden.find((k) => k.id === keep)?.full_name;
    if (!confirm(`${others.length === 1 ? "Den anderen Eintrag" : `Die ${others.length} anderen Einträge`} in «${keepName}» zusammenführen? Das lässt sich nicht rückgängig machen.`)) return;
    start(async () => {
      for (const o of others) {
        const res = await mergeCustomers(keep, o.id);
        if (res.error) {
          setMsg(res.error);
          return;
        }
      }
      setDone(true);
      setMsg("Zusammengeführt.");
    });
  }

  return (
    <div className="card" style={{ padding: 16, marginBottom: 12, opacity: done ? 0.55 : 1 }}>
      <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 8 }}>Grund: {grund}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {kunden.map((k) => (
          <label key={k.id} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, flexWrap: "wrap" }}>
            <input type="radio" name={`keep-${kunden[0].id}`} checked={keep === k.id} onChange={() => setKeep(k.id)} disabled={done} />
            <strong>{k.full_name}</strong>
            <span>{k.email ?? "keine E-Mail"}</span>
            <span>{k.phone ?? "kein Telefon"}</span>
            <span className="td-light">
              seit {datum(k.created_at)} · {k.berater ?? "ohne Berater"} · {k.activity.length} Einträge im Verlauf
              {k.rollen.length ? ` · ${k.rollen.join(", ")}` : ""}
              {k.quelle ? ` · Quelle: ${k.quelle}` : ""}
            </span>
            {keep === k.id && <span className="badge badge-green">bleibt</span>}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
        <button type="button" className="btn btn-primary btn-sm" disabled={pending || done} onClick={merge}>
          {pending ? "Führt zusammen …" : "Zusammenführen"}
        </button>
        {msg && <span style={{ fontSize: 12, color: done ? "var(--green)" : "var(--red)" }}>{msg}</span>}
      </div>
    </div>
  );
}
