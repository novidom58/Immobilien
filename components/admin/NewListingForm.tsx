"use client";

import { useActionState } from "react";
import { createListing } from "@/app/admin/actions";

const initialState = { error: null as string | null };

export function NewListingForm({ beraterOptions }: { beraterOptions: string[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      return createListing(formData);
    },
    initialState
  );

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      <input name="title" placeholder="Titel (z.B. Charmantes Einfamilienhaus mit Garten)" className="field-input sm:col-span-2" />
      <input name="address" required placeholder="Adresse *" className="field-input" />
      <input name="city" required placeholder="Ort *" className="field-input" />
      <input name="postal_code" placeholder="PLZ" className="field-input" />
      <input name="price_chf" inputMode="numeric" placeholder="Preis (CHF)" className="field-input" />
      <select name="property_type" defaultValue="Haus" className="field-select">
        <option value="Haus">Einfamilienhaus</option>
        <option value="Wohnung">Wohnung</option>
        <option value="Stockwerkeigentum">Stockwerkeigentum</option>
        <option value="Rendite">Renditeliegenschaft</option>
        <option value="Andere">Andere</option>
      </select>
      <select name="berater" defaultValue="" className="field-select">
        <option value="">Berater zuweisen</option>
        {beraterOptions.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input name="rooms" inputMode="decimal" placeholder="Zimmer (z.B. 5.5)" className="field-input" />
        <input name="living_area" inputMode="numeric" placeholder="Wohnfläche m²" className="field-input" />
      </div>
      <textarea
        name="description"
        rows={3}
        placeholder="Beschreibung für die öffentliche Detailseite"
        className="field-textarea sm:col-span-2"
      />
      <input name="tour_url" type="url" placeholder="360°-Rundgang-Link (z.B. von Giraffe360)" className="field-input sm:col-span-2" />
      {state.error && (
        <p className="sm:col-span-2" style={{ fontSize: 13, color: "var(--red)" }}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2" style={{ width: "fit-content" }}>
        {pending ? "Wird angelegt…" : "Inserat anlegen"}
      </button>
    </form>
  );
}
