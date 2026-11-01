"use client";

import { useState, useTransition } from "react";
import { adoptPortalAccount } from "@/app/admin/actions";

type Account = { id: string; email: string; full_name: string | null; created_at: string };

/** Registrierte Website-Konten, die noch nicht als Kunde im CRM stehen. */
export function PortalAccounts({ accounts }: { accounts: Account[] }) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (accounts.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <div>
          <div className="card-title">Neu registriert auf der Website ({accounts.length})</div>
          <div className="td-light" style={{ fontSize: 12, marginTop: 2 }}>
            Diese Personen haben ein Kundenkonto erstellt, stehen aber noch nicht in der Kundenliste.
          </div>
        </div>
      </div>
      <div style={{ display: "grid" }}>
        {accounts.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3"
            style={{ padding: "10px 16px", borderTop: "1px solid var(--line, #e7e3dc)" }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{a.full_name || a.email}</div>
              <div className="td-light" style={{ fontSize: 12 }}>
                {a.email} · registriert am {new Date(a.created_at).toLocaleDateString("de-CH")}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={pending && busy === a.id}
              onClick={() => {
                setBusy(a.id);
                setError(null);
                startTransition(async () => {
                  const res = await adoptPortalAccount(a.id);
                  if (res.error) setError(res.error);
                  setBusy(null);
                });
              }}
            >
              {pending && busy === a.id ? "…" : "Als Kunde übernehmen"}
            </button>
          </div>
        ))}
      </div>
      {error && <p style={{ padding: "8px 16px", fontSize: 12, color: "var(--red)" }}>{error}</p>}
    </div>
  );
}
