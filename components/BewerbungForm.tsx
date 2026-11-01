"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Paperclip } from "lucide-react";

const BEREICHE = ["Immobilienberater/in (Verkauf)", "Teamleitung", "Finanzierung & Hypotheken", "Administration & Marketing", "Initiativ / anderes"];
const PENSUM = ["Angestellt", "Selbständig", "Nebenberuflich", "Noch offen"];
const ERFAHRUNG = ["Neu im Immobilienverkauf", "1–3 Jahre", "Über 3 Jahre"];
const NETZWERK = ["Ja, ich bringe Kontakte oder Mandate mit", "Etwas", "Noch nicht"];
const REGIONEN = ["Basel", "Zug", "Beide / flexibel", "Andere Region"];

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-ivory placeholder:text-ivory-dim/60 focus:border-amber focus:outline-none";

/** Bewerbung mit Lebenslauf; geht per Mail mit Anhang ans Team. */
export function BewerbungForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const total = files.reduce((sum, f) => sum + f.size, 0);
    if (total > 4 * 1024 * 1024) {
      setError("Die Unterlagen sind zusammen grösser als 4 MB. Bitte als PDF verkleinern.");
      return;
    }
    setState("sending");
    const res = await fetch("/api/bewerbung", { method: "POST", body: new FormData(e.currentTarget) }).catch(() => null);
    if (res?.ok) {
      setState("done");
      return;
    }
    const data = await res?.json().catch(() => null);
    setError(data?.error ?? "Das hat nicht geklappt. Bitte später nochmals versuchen.");
    setState("idle");
  }

  if (state === "done") {
    return (
      <div className="rounded-[24px] border border-line bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" strokeWidth={1.5} />
        <div className="mt-4 font-display text-2xl text-ivory">Danke für Ihre Bewerbung!</div>
        <p className="mt-2 text-ivory-dim">Wir schauen sie persönlich an und melden uns innert zehn Arbeitstagen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[24px] border border-line bg-white p-6 sm:grid-cols-2 lg:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="text-sm text-ivory-dim">
        Vor- und Nachname *
        <input name="name" required autoComplete="name" className={`${field} mt-1`} />
      </label>
      <label className="text-sm text-ivory-dim">
        E-Mail *
        <input name="email" type="email" required autoComplete="email" className={`${field} mt-1`} />
      </label>
      <label className="text-sm text-ivory-dim">
        Telefon
        <input name="phone" type="tel" autoComplete="tel" className={`${field} mt-1`} />
      </label>
      <label className="text-sm text-ivory-dim">
        Interesse an
        <select name="bereich" defaultValue="" className={`${field} mt-1`}>
          <option value="">Bitte wählen</option>
          {BEREICHE.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>
      <label className="text-sm text-ivory-dim">
        Zusammenarbeit
        <select name="pensum" defaultValue="" className={`${field} mt-1`}>
          <option value="">Bitte wählen</option>
          {PENSUM.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="text-sm text-ivory-dim">
        Region
        <select name="region" defaultValue="" className={`${field} mt-1`}>
          <option value="">Bitte wählen</option>
          {REGIONEN.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label className="text-sm text-ivory-dim">
        Erfahrung im Immobilienverkauf
        <select name="erfahrung" defaultValue="" className={`${field} mt-1`}>
          <option value="">Bitte wählen</option>
          {ERFAHRUNG.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </label>
      <label className="text-sm text-ivory-dim sm:col-span-2">
        Eigenes Netzwerk (für Eigenakquise)
        <select name="netzwerk" defaultValue="" className={`${field} mt-1`}>
          <option value="">Bitte wählen</option>
          {NETZWERK.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <label className="text-sm text-ivory-dim sm:col-span-2">
        Was bringen Sie mit, und wo möchten Sie in zwei Jahren stehen?
        <textarea name="message" rows={5} className={`${field} mt-1`} />
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 py-4 text-sm text-ivory-dim hover:border-amber sm:col-span-2">
        <Paperclip className="h-5 w-5 shrink-0 text-amber" strokeWidth={1.5} />
        <span className="min-w-0 flex-1">
          {files.length ? files.map((f) => f.name).join(", ") : "Lebenslauf und Zeugnisse anhängen (PDF, Word oder Bild, zusammen max. 4 MB)"}
        </span>
        <input
          type="file"
          name="unterlagen"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </label>
      {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="rounded-full bg-night px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-amber disabled:opacity-60">
          {state === "sending" ? "Wird gesendet…" : "Gespräch anfragen"}
        </button>
        <p className="text-xs text-ivory-dim">Ihre Unterlagen behandeln wir vertraulich und nutzen sie nur für diese Bewerbung.</p>
      </div>
    </form>
  );
}
