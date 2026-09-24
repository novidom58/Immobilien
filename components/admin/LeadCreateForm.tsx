"use client";

import { useActionState } from "react";
import { createLeadManually } from "@/app/admin/actions";
import { LEAD_SOURCE_OPTIONS } from "@/lib/constants";

const initialState = { error: null as string | null };

const fieldClasses =
  "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

export function LeadCreateForm({ listings }: { listings: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => createLeadManually(formData),
    initialState
  );

  return (
    <form action={formAction} className="grid gap-2.5 sm:grid-cols-2">
      <input name="name" required placeholder="Name *" className={fieldClasses} />
      <input name="email" type="email" required placeholder="E-Mail *" className={fieldClasses} />
      <input name="phone" placeholder="Telefon" className={fieldClasses} />
      <select name="type" defaultValue="contact" className={fieldClasses}>
        <option value="contact">Kontakt</option>
        <option value="valuation">Bewertungsanfrage</option>
        <option value="access_request">Ratgeber-Anfrage</option>
      </select>
      <select name="source" defaultValue="" className={fieldClasses}>
        <option value="">Quelle (optional)</option>
        {LEAD_SOURCE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {listings.length > 0 && (
        <select name="listing_id" defaultValue="" className={`${fieldClasses} sm:col-span-2`}>
          <option value="">Kein Objekt-Bezug</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      )}
      <textarea
        name="message"
        rows={2}
        placeholder="Notiz / Nachricht"
        className={`${fieldClasses} resize-none sm:col-span-2`}
      />
      {state.error && <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {pending ? "Wird erfasst…" : "Lead erfassen"}
      </button>
    </form>
  );
}
