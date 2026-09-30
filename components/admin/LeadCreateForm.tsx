"use client";

import { useActionState } from "react";
import { createLeadManually } from "@/app/admin/actions";
import { LEAD_SOURCE_OPTIONS } from "@/lib/constants";

const initialState = { error: null as string | null };

export function LeadCreateForm({ listings }: { listings: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => createLeadManually(formData),
    initialState
  );

  return (
    <form action={formAction} className="grid gap-2.5 sm:grid-cols-2">
      <input name="name" required placeholder="Name *" className="field-input" />
      <input name="email" type="email" required placeholder="E-Mail *" className="field-input" />
      <input name="phone" placeholder="Telefon" className="field-input" />
      <select name="type" defaultValue="contact" className="field-select">
        <option value="contact">Kontakt</option>
        <option value="valuation">Bewertungsanfrage</option>
        <option value="access_request">Ratgeber-Anfrage</option>
      </select>
      <select name="source" defaultValue="" className="field-select">
        <option value="">Quelle (optional)</option>
        {LEAD_SOURCE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {listings.length > 0 && (
        <select name="listing_id" defaultValue="" className="field-select sm:col-span-2">
          <option value="">Kein Objekt-Bezug</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      )}
      <textarea name="message" rows={2} placeholder="Notiz / Nachricht" className="field-textarea sm:col-span-2" />
      {state.error && (
        <p className="sm:col-span-2" style={{ fontSize: 13, color: "var(--red)" }}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2" style={{ width: "fit-content" }}>
        {pending ? "Wird erfasst…" : "Lead erfassen"}
      </button>
    </form>
  );
}
