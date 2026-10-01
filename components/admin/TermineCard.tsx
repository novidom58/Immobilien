"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createTermin, deleteTermin } from "@/app/admin/actions";
import type { UpcomingTermin } from "@/lib/admin-data";

const TYPE_OPTIONS = [
  { value: "erstgespraech", label: "Erstgespräch" },
  { value: "besichtigung", label: "Besichtigung" },
  { value: "notartermin", label: "Notartermin" },
  { value: "sonstiges", label: "Sonstiges" },
];

export function TermineCard({
  termine,
  customers,
  beraterOptions,
}: {
  termine: UpcomingTermin[];
  customers: { id: string; full_name: string }[];
  beraterOptions: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  async function handleCreate(formData: FormData) {
    setBusy("create");
    setError(null);
    const res = await createTermin(formData);
    setBusy(null);
    if (res.error) setError(res.error);
    else {
      setFormOpen(false);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Termin wirklich löschen?")) return;
    setBusy(id);
    const res = await deleteTermin(id);
    setBusy(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">📅 Termine</div>
          <div className="card-sub">Erstgespräche, Besichtigungen, Notartermine</div>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setFormOpen((v) => !v)}>
          {formOpen ? "Abbrechen" : "+ Termin"}
        </button>
      </div>

      {formOpen && (
        <form action={handleCreate} className="grid gap-2.5 sm:grid-cols-2" style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
          <input name="title" required placeholder="Titel (z.B. Besichtigung Güterstrasse 14)" className="field-input sm:col-span-2" />
          <select name="type" defaultValue="besichtigung" className="field-select">
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select name="customer_id" defaultValue="" className="field-select">
            <option value="">Kein Kunde</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
          <input name="date" type="date" required className="field-input" />
          <input name="time" type="time" defaultValue="09:00" className="field-input" />
          <select name="berater" defaultValue="" className="field-select">
            <option value="">Zuständig</option>
            {beraterOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input name="notes" placeholder="Notiz (optional)" className="field-input" />
          {error && (
            <p className="sm:col-span-2" style={{ fontSize: 13, color: "var(--red)" }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={busy === "create"} className="btn btn-primary btn-sm sm:col-span-2" style={{ width: "fit-content" }}>
            {busy === "create" ? "Speichert…" : "Termin speichern"}
          </button>
        </form>
      )}

      {termine.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <div className="empty-text">Keine Termine</div>
        </div>
      ) : (
        <div>
          {termine.map((t) => (
            <div key={t.id} className="tl-entry" style={{ padding: "12px 20px" }}>
              <div className="tl-icon tl-blue">📅</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tl-title">{t.title}</div>
                <div className="tl-meta">
                  {new Date(t.starts_at).toLocaleString("de-CH", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  {" · "}
                  {t.typeLabel}
                  {t.customerName ? ` · ${t.customerName}` : ""}
                  {t.berater ? ` · ${t.berater}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                disabled={busy === t.id}
                aria-label="Termin löschen"
                style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer" }}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
