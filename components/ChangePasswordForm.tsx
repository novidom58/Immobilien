"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const supabase = createClient();
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
      setError("Das Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (password !== confirm) {
      setError("Die Passwörter stimmen nicht überein.");
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
    onSuccess?.();
  }

  if (done) {
    return <p className="text-sm text-amber-soft">Passwort erfolgreich geändert.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
          Neues Passwort
        </label>
        <input
          id="new-password"
          required
          minLength={6}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
          Passwort bestätigen
        </label>
        <input
          id="confirm-password"
          required
          minLength={6}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 self-start rounded-full bg-amber px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink disabled:opacity-60"
      >
        {loading ? "Wird gespeichert…" : "Passwort speichern"}
      </button>
    </form>
  );
}
