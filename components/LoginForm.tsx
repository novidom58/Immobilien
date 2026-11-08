"use client";

import { PasswordInput } from "@/components/ui/PasswordInput";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ForgotPassword } from "@/components/ForgotPassword";
import { authErrorText } from "@/lib/authErrors";

type Mode = "login" | "signup";

// Wofür jemand das Portal nutzen will: bestimmt, was im Portal zuerst steht
const ZIELE = [
  { value: "verkaufen", label: "Mit NoviDom verkaufen" },
  { value: "kaufen", label: "Ein Zuhause finden" },
  { value: "finanzieren", label: "Finanzierung prüfen" },
  { value: "versichern", label: "Versicherungen vergleichen" },
  { value: "umbauen", label: "Umbau planen" },
  { value: "eigentum", label: "Mein Eigentum im Blick" },
] as const;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ziel, setZiel] = useState<string>(() => {
    const f = searchParams.get("fokus") ?? "";
    return ZIELE.some((z) => z.value === f) ? f : "";
  });
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);

  if (!supabase) {
    return (
      <div className="rounded-xl border border-amber/30 bg-amber/10 p-6 text-center">
        <p className="text-ivory">
          Das Kundenlogin ist noch nicht eingerichtet.
        </p>
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
          Wir haben Ihnen einen Bestätigungslink an{" "}
          <span className="text-amber-soft">{email}</span> gesendet. Bitte
          klicken Sie darauf, um Ihr Konto zu aktivieren.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);

    if (mode === "signup" && !ziel) {
      setLoading(false);
      setError("Bitte wählen Sie, wofür Sie NoviDom nutzen möchten.");
      return;
    }

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(authErrorText(signInError));
        return;
      }
      router.push(searchParams.get("redirect") || "/dashboard");
      router.refresh();
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, first_name: firstName.trim(), last_name: lastName.trim(), anliegen: ziel || undefined } },
      });
      setLoading(false);
      if (signUpError) {
        setError(authErrorText(signUpError));
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
              mode === m
                ? "bg-amber text-ink"
                : "text-ivory-dim hover:text-ivory"
            }`}
          >
            {m === "login" ? "Anmelden" : "Registrieren"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <fieldset>
            <legend className="mb-2 font-mono text-xs uppercase tracking-wide text-ivory-dim">Wobei können wir helfen?</legend>
            <div className="grid grid-cols-2 gap-2">
              {ZIELE.map((z) => (
                <button
                  key={z.value}
                  type="button"
                  aria-pressed={ziel === z.value}
                  onClick={() => setZiel(z.value)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    ziel === z.value ? "border-night bg-night text-ink" : "border-line bg-ink-2 text-ivory hover:border-ivory-dim/50"
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-ivory-dim">Das sehen Sie im Portal zuerst. Alles andere bleibt einen Klick entfernt.</p>
          </fieldset>
        )}
        {mode === "signup" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstName" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
                Vorname
              </label>
              <input
                id="firstName"
                required
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className="font-mono text-xs uppercase tracking-wide text-ivory-dim">
                Nachname
              </label>
              <input
                id="lastName"
                required
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
              />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="font-mono text-xs uppercase tracking-wide text-ivory-dim"
          >
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
          <label
            htmlFor="password"
            className="font-mono text-xs uppercase tracking-wide text-ivory-dim"
          >
            Passwort
          </label>
          <PasswordInput
            id="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-xl border border-line bg-ink-2 px-4 py-3 text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-amber px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-ink transition-shadow hover:shadow-[0_0_40px_-8px_rgba(143,106,57,0.28)] disabled:opacity-60"
        >
          {loading
            ? "Einen Moment…"
            : mode === "login"
              ? "Anmelden"
              : "Konto erstellen"}
        </button>
      </form>
      {mode === "login" && (
        <div className="mt-5">
          <ForgotPassword initialEmail={email} />
        </div>
      )}
    </div>
  );
}
