"use client";

import { useState, type FormEvent } from "react";

const field =
  "w-full rounded-lg border border-line bg-ink px-3.5 py-2.5 font-sans text-sm text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";

/**
 * Exposé erst nach Angabe von Vorname, Nachname und E-Mail. Danach öffnet es
 * sich direkt und kommt zusätzlich per Mail. Zwei Tage später fragen wir nach.
 */
export function ExposeRequest({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const res = await fetch("/api/expose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, listingId }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) {
      setState("error");
      setError(data.error ?? "Senden fehlgeschlagen, bitte erneut versuchen.");
      return;
    }
    setUrl(data.url ?? `/immobilien/${listingId}/expose`);
    setState("done");
    window.open(data.url ?? `/immobilien/${listingId}/expose`, "_blank", "noopener");
  }

  if (state === "done" && url) {
    return (
      <p className="mt-4 text-sm text-ivory">
        Danke! Das Exposé kommt auch per E-Mail.{" "}
        <a href={url} target="_blank" rel="noopener" className="text-amber underline underline-offset-4">
          Jetzt öffnen →
        </a>
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4 hover:text-amber-soft"
      >
        Exposé als PDF erhalten →
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-2.5 rounded-xl border border-line p-4">
      <p className="text-xs text-ivory-dim">Wohin dürfen wir das Exposé schicken?</p>
      <div className="grid grid-cols-2 gap-2.5">
        <input required placeholder="Vorname" autoComplete="given-name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={field} />
        <input required placeholder="Nachname" autoComplete="family-name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={field} />
      </div>
      <input required type="email" placeholder="E-Mail-Adresse" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
      <input type="tel" placeholder="Telefon (optional)" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="rounded-lg bg-night px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-60">
        {state === "sending" ? "Wird gesendet…" : "Exposé erhalten"}
      </button>
    </form>
  );
}
