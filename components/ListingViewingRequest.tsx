"use client";

import { useState, type FormEvent } from "react";
import { ZEITFENSTER, wunschText } from "@/lib/wunschtermine";

const fieldClasses =
  "w-full rounded-lg border border-line bg-ink px-3.5 py-2.5 font-sans text-sm text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";

type Wunsch = { datum: string; zeit: string };

const isoTag = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

function formatWunsch(w: Wunsch) {
  const datum = new Date(`${w.datum}T12:00:00`).toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${datum}, ${ZEITFENSTER.find((z) => z.value === w.zeit)?.label ?? w.zeit}`;
}

/**
 * Besichtigung anfragen mit drei Wunschterminen. Das Team fragt danach beim
 * Eigentümer nach, welcher passt, und bestätigt den Termin.
 */
export function ListingViewingRequest({ listingId, address }: { listingId: string; address: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wishes, setWishes] = useState<Wunsch[]>([
    { datum: "", zeit: "nachmittag" },
    { datum: "", zeit: "abend" },
    { datum: "", zeit: "vormittag" },
  ]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [hint, setHint] = useState<string | null>(null);

  const setWish = (i: number, patch: Partial<Wunsch>) => setWishes((ws) => ws.map((w, j) => (j === i ? { ...w, ...patch } : w)));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const keys = wishes.map((w) => `${w.datum}|${w.zeit}`);
    if (new Set(keys).size < 3) {
      setHint("Bitte drei verschiedene Termine wählen.");
      return;
    }
    setHint(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          first_name: firstName.trim(),
          email,
          phone,
          message: wunschText(address, wishes.map(formatWunsch)),
          listingId,
          source: "besichtigung",
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-6 rounded-xl border border-line bg-ink p-4 text-sm text-ivory">
        <p className="font-semibold">Danke{firstName ? `, ${firstName.trim()}` : ""}!</p>
        <p className="mt-2 text-ivory-dim">
          Wir klären Ihre drei Wunschtermine mit der Eigentümerschaft und bestätigen Ihnen den Termin per E-Mail oder Telefon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <input required type="text" placeholder="Vorname" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClasses} />
        <input required type="text" placeholder="Nachname" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClasses} />
      </div>
      <input required type="email" placeholder="E-Mail-Adresse" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClasses} />
      <input required type="tel" placeholder="Telefon" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClasses} />

      <p className="mt-2 text-xs text-ivory-dim">Ihre drei Wunschtermine. Wir fragen bei der Eigentümerschaft nach und bestätigen einen davon.</p>
      {wishes.map((w, i) => (
        <div key={i} className="grid grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
          <span className="font-mono text-xs text-amber">{i + 1}.</span>
          <input
            required
            type="date"
            min={isoTag(1)}
            max={isoTag(90)}
            value={w.datum}
            onChange={(e) => setWish(i, { datum: e.target.value })}
            aria-label={`Wunschtermin ${i + 1}: Datum`}
            className={fieldClasses}
          />
          <select value={w.zeit} onChange={(e) => setWish(i, { zeit: e.target.value })} aria-label={`Wunschtermin ${i + 1}: Zeit`} className={fieldClasses}>
            {ZEITFENSTER.map((z) => (
              <option key={z.value} value={z.value}>
                {z.kurz}
              </option>
            ))}
          </select>
        </div>
      ))}

      {hint && <p className="text-xs text-red-400">{hint}</p>}
      {status === "error" && <p className="text-xs text-red-400">Senden fehlgeschlagen, bitte erneut versuchen.</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 w-full rounded-lg bg-amber px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide text-ink transition-opacity disabled:opacity-60"
      >
        {status === "sending" ? "Wird gesendet…" : "Besichtigung anfragen"}
      </button>
    </form>
  );
}
