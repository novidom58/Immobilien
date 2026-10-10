"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { submitFeedback } from "@/app/feedback/actions";

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ivory placeholder:text-ivory-dim/60 focus:border-amber focus:outline-none";

function Choice({ name, options }: { name: string; options: [string, string][] }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {options.map(([value, label]) => (
        <label key={value} className="cursor-pointer">
          <input type="radio" name={name} value={value} className="peer sr-only" />
          <span className="block rounded-xl border border-line bg-white px-2 py-3 text-center text-sm text-ivory peer-checked:border-amber peer-checked:bg-amber peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-amber">
            {label}
          </span>
        </label>
      ))}
    </div>
  );
}

export function FeedbackForm({ listingId, kanal }: { listingId: string; kanal: string }) {
  const [rating, setRating] = useState(0);
  const [state, setState] = useState<{ busy: boolean; error: string | null; done: boolean }>({ busy: false, error: null, done: false });

  async function handle(formData: FormData) {
    setState({ busy: true, error: null, done: false });
    formData.set("rating", String(rating || ""));
    formData.set("kanal", kanal);
    const res = await submitFeedback(listingId, formData);
    setState({ busy: false, error: res.error, done: !res.error });
  }

  if (state.done) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-white p-6">
        <div className="font-display text-2xl text-ivory">Herzlichen Dank!</div>
        <p className="mt-2 text-ivory-dim">Ihr Feedback ist angekommen. Möchten Sie gleich weitermachen?</p>
        <div className="mt-5 grid gap-2">
          <Link href={`/dashboard#finanzierung`} className="rounded-full bg-night px-5 py-3.5 text-center text-sm font-semibold text-ink">
            Finanzierung prüfen
          </Link>
          <Link href="/dashboard#suchprofil" className="rounded-full border border-line px-5 py-3.5 text-center text-sm text-ivory">
            Suchprofil mit Käufer-Alarm anlegen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={handle} className="mt-8 grid gap-7">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset>
        <legend className="font-semibold text-ivory">Wie hat Ihnen das Objekt gefallen?</legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Sterne">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} von 5 Sternen`}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <Star className={`h-10 w-10 ${n <= rating ? "fill-amber text-amber" : "text-ivory-dim/40"}`} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-semibold text-ivory">Der Preis ist …</legend>
        <Choice name="preis" options={[["zu_tief", "eher tief"], ["passt", "passend"], ["zu_hoch", "eher hoch"]]} />
      </fieldset>

      <fieldset>
        <legend className="font-semibold text-ivory">Haben Sie Interesse?</legend>
        <Choice name="interesse" options={[["ja", "Ja"], ["vielleicht", "Vielleicht"], ["nein", "Nein"]]} />
      </fieldset>

      <label className="block">
        <span className="font-semibold text-ivory">Was hat Ihnen gefallen?</span>
        <textarea name="positiv" rows={2} className={`${field} mt-2`} placeholder="z.B. Lage, Licht, Garten" />
      </label>
      <label className="block">
        <span className="font-semibold text-ivory">Was hat Sie gestört?</span>
        <textarea name="negativ" rows={2} className={`${field} mt-2`} placeholder="z.B. Küche, Lärm, Grundriss" />
      </label>
      <label className="block">
        <span className="font-semibold text-ivory">Ihr Vorname (freiwillig)</span>
        <input name="name" className={`${field} mt-2`} autoComplete="given-name" />
      </label>

      {state.error && <p className="text-sm text-[#c0392b]">{state.error}</p>}
      <button type="submit" disabled={state.busy} className="rounded-full bg-night px-6 py-4 text-base font-semibold text-ink hover:bg-amber disabled:opacity-60">
        {state.busy ? "Wird gesendet …" : "Feedback senden"}
      </button>
      <p className="text-center text-xs text-ivory-dim">Der Verkäufer sieht Ihre Antworten ohne Ihre Kontaktdaten.</p>
    </form>
  );
}
