"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createBerater, deleteBerater } from "@/app/admin/actions";

export function BeraterManager({ berater }: { berater: { id: string; name: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    setBusy("add");
    setError(null);
    const res = await createBerater(formData);
    setBusy(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`"${name}" wirklich entfernen? Bereits zugewiesene Objekte behalten den Namen als Text.`)) return;
    setBusy(id);
    setError(null);
    const res = await deleteBerater(id);
    setBusy(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div style={{ padding: 20 }}>
        {berater.length === 0 ? (
          <p className="td-light" style={{ fontSize: 13, marginBottom: 18 }}>
            Noch niemand erfasst.
          </p>
        ) : (
          <div style={{ marginBottom: 18 }}>
            {berater.map((b) => (
              <div key={b.id} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="bchip">{b.name}</span>
                <button
                  type="button"
                  disabled={busy === b.id}
                  onClick={() => handleDelete(b.id, b.name)}
                  aria-label="Entfernen"
                  style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer" }}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form action={handleAdd} className="flex items-end gap-2">
          <div className="field-group" style={{ flex: 1, margin: 0 }}>
            <div className="field-label">Name</div>
            <input name="name" required placeholder="z.B. Arber" className="field-input" />
          </div>
          <button type="submit" disabled={busy === "add"} className="btn btn-primary">
            {busy === "add" ? "…" : "Hinzufügen"}
          </button>
        </form>
        {error && (
          <p style={{ marginTop: 10, fontSize: 12, color: "var(--red)" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
