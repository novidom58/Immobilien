"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing } from "lucide-react";
import { saveSearchProfile } from "@/app/dashboard/actions";

export type SearchProfile = {
  kauf_zeitpunkt: string | null;
  wunsch_ort: string | null;
  objekt_typ: string | null;
  zimmer_min: number | null;
  budget_max: number | null;
  alarm_opt_in: boolean;
};

const field =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-ivory placeholder:text-ivory-dim/50 focus:border-amber focus:outline-none";
const label = "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ivory-dim";

export function SearchProfileForm({ profile }: { profile: SearchProfile | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setBusy(true);
    setMessage(null);
    const res = await saveSearchProfile(formData);
    setBusy(false);
    if (res.error) setMessage({ ok: false, text: res.error });
    else {
      setMessage({ ok: true, text: "Gespeichert. Passende Objekte sehen Sie unten." });
      router.refresh();
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className={label}>Wann möchten Sie kaufen?</span>
        <select name="kauf_zeitpunkt" defaultValue={profile?.kauf_zeitpunkt ?? ""} className={field}>
          <option value="">Bitte wählen</option>
          <option value="sofort">So bald wie möglich</option>
          <option value="3-6 Monate">In 3 bis 6 Monaten</option>
          <option value="6-12 Monate">In 6 bis 12 Monaten</option>
          <option value="1-2 Jahre">In 1 bis 2 Jahren</option>
          <option value="nur am Schauen">Ich schaue mich erst um</option>
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className={label}>Wo? (Orte, mit Komma getrennt)</span>
        <input name="wunsch_ort" defaultValue={profile?.wunsch_ort ?? ""} placeholder="z.B. Allschwil, Binningen, Basel" className={field} />
      </label>
      <label>
        <span className={label}>Objekt</span>
        <select name="objekt_typ" defaultValue={profile?.objekt_typ ?? ""} className={field}>
          <option value="">Egal</option>
          <option value="Wohnung">Eigentumswohnung</option>
          <option value="Haus">Einfamilienhaus</option>
          <option value="Rendite">Renditeliegenschaft</option>
          <option value="Andere">Andere</option>
        </select>
      </label>
      <label>
        <span className={label}>Mindestens Zimmer</span>
        <select name="zimmer_min" defaultValue={profile?.zimmer_min ? String(profile.zimmer_min) : ""} className={field}>
          <option value="">Egal</option>
          {["2.5", "3.5", "4.5", "5.5", "6.5"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className={label}>Budget bis (CHF)</span>
        <input
          name="budget_max"
          inputMode="numeric"
          defaultValue={profile?.budget_max ?? ""}
          placeholder="z.B. 1'300'000 (der Finanzierungs-Check hilft dabei)"
          className={field}
        />
      </label>
      <label className="flex items-start gap-3 rounded-xl border border-line bg-ink-2 p-4 sm:col-span-2">
        <input type="checkbox" name="alarm_opt_in" defaultChecked={profile?.alarm_opt_in ?? false} className="mt-1 h-4 w-4 accent-amber" />
        <span>
          <span className="flex items-center gap-2 font-semibold text-ivory">
            <BellRing className="h-4 w-4 text-amber" strokeWidth={1.5} />
            Käufer-Alarm aktivieren
          </span>
          <span className="mt-1 block text-sm text-ivory-dim">
            Sobald ein passendes Objekt kommt, melden wir uns per E-Mail, oft bevor es auf den Portalen erscheint.
          </span>
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-night px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-amber disabled:opacity-60"
        >
          {busy ? "Speichert …" : "Suchprofil speichern"}
        </button>
        {message && <span className={`text-sm ${message.ok ? "text-emerald-700" : "text-red-700"}`}>{message.text}</span>}
      </div>
    </form>
  );
}
