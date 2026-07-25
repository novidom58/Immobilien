"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  if (!supabase) {
    return (
      <div className="rounded-xl border border-amber/30 bg-amber/10 p-6 text-center">
        <p className="text-ivory">Das Kundenlogin ist noch nicht eingerichtet.</p>
        <p className="mt-2 text-sm text-ivory-dim">
          Sobald Ihr Verkaufsmandat startet, erhalten Sie automatisch Zugang.
          Bis dahin erreichen Sie uns direkt über die kostenlose Bewertung.
        </p>
        <Link
          href="/#kontakt"
          className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4"
        >
          Zur kostenlosen Bewertung
        </Link>
      </div>
    );
  }

  if (signupDone) {
    return (
      <div className="rounded-xl border border-amber/30 bg-amber/10 p-6 text-center">
        <p className="text-ivory">Fast geschafft!</p>
        <p className="mt-2 text-sm text-ivory-dim">
          Wir haben Ihnen einen Bestätigungslink an <span className="text-amber-soft">{email}</span> gesendet.
          Bitte klicken Sie darauf, um Ihr Konto zu aktivieren.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(
          signInError.message === "Invalid login credentials"
            ? "E-Mail oder Passwort ist falsch."
            : signInError.message
        );
        return;
      }
      router.push(searchParams.get("redirect") || "/dashboard");
      router.refresh();
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setSignupDone(true);
    }
  }

  return (
    <div>
      <div className="mb-6 flex rounded-full border border-line bg-ink-2 p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
              mode === m ? "bg-amber text-ink" : "text-ivory-dim hover:text-ivory"
            }`}
          >
            {m === "login" ? "Anmelden" : "Registrieren"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
              Name
            </label>
            <input
              id="fullName"
              required
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ihr Name"
              className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
            />
          </div>
        )}
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
            placeholder="ihre.email@beispiel.ch"
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
            minLength={6}
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
          {loading ? "Einen Moment…" : mode === "login" ? "Anmelden" : "Konto erstellen"}
        </button>
      </form>
    </div>
  );
}
