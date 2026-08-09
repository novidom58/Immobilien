"use client";

import { useActionState } from "react";
import { createListing } from "@/app/admin/actions";

const initialState = { error: null as string | null };

const inputClasses =
  "rounded-xl border border-line bg-ink px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

export function NewListingForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createListing(formData);
    },
    initialState
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input
        name="title"
        placeholder="Titel (z.B. Charmantes Einfamilienhaus mit Garten)"
        className={`${inputClasses} sm:col-span-2`}
      />
      <input name="address" required placeholder="Adresse *" className={inputClasses} />
      <input name="city" required placeholder="Ort *" className={inputClasses} />
      <input name="postal_code" placeholder="PLZ" className={inputClasses} />
      <input name="price_chf" inputMode="numeric" placeholder="Preis (CHF)" className={inputClasses} />
      <select name="property_type" defaultValue="Haus" className={inputClasses}>
        <option value="Haus">Einfamilienhaus</option>
        <option value="Wohnung">Wohnung</option>
        <option value="Stockwerkeigentum">Stockwerkeigentum</option>
        <option value="Rendite">Renditeliegenschaft</option>
        <option value="Andere">Andere</option>
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input name="rooms" inputMode="decimal" placeholder="Zimmer (z.B. 5.5)" className={inputClasses} />
        <input name="living_area" inputMode="numeric" placeholder="Wohnfläche m²" className={inputClasses} />
      </div>
      <textarea
        name="description"
        rows={3}
        placeholder="Beschreibung für die öffentliche Detailseite"
        className={`${inputClasses} resize-none sm:col-span-2`}
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
