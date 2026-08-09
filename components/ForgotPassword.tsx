"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPassword({ initialEmail = "" }: { initialEmail?: string }) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!supabase) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start font-mono text-xs uppercase tracking-wide text-ivory-dim/70 underline underline-offset-4 hover:text-ivory"
      >
        Passwort vergessen?
      </button>
    );
  }

  if (sent) {
    return (
      <p className="text-sm text-ivory-dim">
        Falls <span className="text-amber-soft">{email}</span> registriert ist, ist ein
        Reset-Link unterwegs. Bitte E-Mail-Postfach prüfen.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-xl border border-line bg-ink-2 p-4">
      <label htmlFor="reset-email" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
        E-Mail für den Reset-Link
      </label>
      <input
        id="reset-email"
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ihre.email@beispiel.ch"
        className="rounded-xl border border-line bg-ink px-4 py-2.5 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="mt-1 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-amber px-5 py-2 font-mono text-xs uppercase tracking-wide text-ink disabled:opacity-60"
        >
          {loading ? "Wird gesendet…" : "Link senden"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
