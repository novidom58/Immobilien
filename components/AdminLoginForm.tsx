"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supabase) {
    return (
      <p className="rounded-xl border border-amber/30 bg-amber/10 p-6 text-center text-ivory-dim">
        Admin-Login ist noch nicht eingerichtet.
      </p>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setLoading(false);
      setError("E-Mail oder Passwort ist falsch.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Dieses Konto hat keinen Admin-Zugang.");
      return;
    }

    setLoading(false);
    router.push(searchParams.get("redirect") || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
          Passwort
        </label>
        <input
          id="password"
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-ink transition-shadow hover:shadow-[0_0_40px_-8px_rgba(232,168,85,0.65)] disabled:opacity-60"
      >
        {loading ? "Einen Moment…" : "Anmelden"}
      </button>
    </form>
  );
}
