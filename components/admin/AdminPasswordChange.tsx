"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminPasswordChange() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!supabase) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);

    if (password.length < 6) {
      setError("Mindestens 6 Zeichen.");
      return;
    }
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="crm-nav-item"
        style={{ width: "100%", justifyContent: "flex-start" }}
      >
        Passwort ändern
      </button>
      {open && (
        <div className="px-4 pt-2">
          {done ? (
            <p style={{ fontSize: 12, color: "var(--green)" }}>Passwort geändert.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                required
                minLength={6}
                type="password"
                placeholder="Neues Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
              />
              <input
                required
                minLength={6}
                type="password"
                placeholder="Bestätigen"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="field-input"
              />
              {error && <p style={{ fontSize: 11, color: "var(--red)" }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                {loading ? "…" : "Speichern"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
