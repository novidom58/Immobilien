"use client";

import { useState, type FormEvent } from "react";

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK;

const fieldClasses =
  "w-full rounded-lg border border-line bg-ink px-3.5 py-2.5 font-sans text-sm text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";

export function ListingViewingRequest({ listingId, address }: { listingId: string; address: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name,
          email,
          phone,
          message: `Besichtigungsanfrage für ${address}`,
          listingId,
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (CAL_LINK) {
    return (
      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <iframe
          src={`https://cal.com/${CAL_LINK}?theme=dark&hide_landing_page_details=1`}
          title="Besichtigungstermin wählen"
          className="h-[520px] w-full"
          loading="lazy"
        />
      </div>
    );
  }

  if (status === "done") {
    return (
      <p className="mt-6 text-sm text-ivory">
        Danke{name ? `, ${name.split(" ")[0]}` : ""}! Wir melden uns mit passenden Besichtigungsterminen.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2.5">
      <input
        required
        type="text"
        placeholder="Ihr Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={fieldClasses}
      />
      <input
        required
        type="email"
        placeholder="Ihre E-Mail-Adresse"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={fieldClasses}
      />
      <input
        type="tel"
        placeholder="Telefon (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={fieldClasses}
      />
      {status === "error" && (
        <p className="text-xs text-red-400">Senden fehlgeschlagen, bitte erneut versuchen.</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 w-full rounded-lg bg-amber px-4 py-3 font-display text-xs font-semibold uppercase tracking-wide text-ink transition-opacity disabled:opacity-60"
      >
        {status === "sending" ? "Wird gesendet…" : "Besichtigung anfragen"}
      </button>
    </form>
  );
}
