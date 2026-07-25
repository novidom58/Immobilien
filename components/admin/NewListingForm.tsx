"use client";

import { useActionState } from "react";
import { createListing } from "@/app/admin/actions";

const initialState = { error: null as string | null };

export function NewListingForm() {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    return createListing(formData);
  }, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input
        name="address"
        required
        placeholder="Adresse"
        className="rounded-xl border border-line bg-ink px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
      />
      <input
        name="city"
        required
        placeholder="Ort"
        className="rounded-xl border border-line bg-ink px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
      />
      <input
        name="postal_code"
        placeholder="PLZ"
        className="rounded-xl border border-line bg-ink px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
      />
      <input
        name="price_chf"
        type="number"
        placeholder="Preis (CHF, optional)"
        className="rounded-xl border border-line bg-ink px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
      />
      {state.error && <p className="text-sm text-red-400 sm:col-span-2">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-amber px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-ink disabled:opacity-60 sm:col-span-2"
      >
        {pending ? "Wird angelegt…" : "Inserat anlegen"}
      </button>
    </form>
  );
}
