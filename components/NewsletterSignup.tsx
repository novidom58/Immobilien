"use client";

import { useState, type FormEvent } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-xs text-amber-soft">Danke, Sie sind angemeldet.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        required
        type="email"
        placeholder="E-Mail für Objekt-Updates"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-44 rounded-full border border-line bg-ink-2 px-3.5 py-1.5 text-xs text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none sm:w-56"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="shrink-0 rounded-full border border-amber/40 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-amber-soft hover:border-amber disabled:opacity-50"
      >
        {status === "sending" ? "…" : "Abonnieren"}
      </button>
      {status === "error" && <span className="text-xs text-red-400">Fehler</span>}
    </form>
  );
}
