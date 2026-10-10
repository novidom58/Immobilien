"use client";

import { useActionState } from "react";
import { createCustomer } from "@/app/admin/actions";
import { formatSwissPhone } from "@/lib/phone";
import { CUSTOMER_ROLES, LEAD_SOURCE_OPTIONS } from "@/lib/constants";

const initialState = { error: null as string | null };

export function CustomerCreateForm({ beraterOptions }: { beraterOptions: string[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => createCustomer(formData),
    initialState
  );

  return (
    <form action={formAction} className="grid gap-2.5 sm:grid-cols-2">
      <input name="vorname" placeholder="Vorname" className="field-input" />
      <input name="nachname" required placeholder="Nachname *" className="field-input" />
      <input name="email" type="email" placeholder="E-Mail" className="field-input" />
      <input
        name="phone"
        placeholder="Telefon"
        className="field-input"
        onBlur={(e) => {
          e.target.value = formatSwissPhone(e.target.value);
        }}
      />
      <input name="address" placeholder="Adresse" className="field-input sm:col-span-2" />
      <select name="ziel" defaultValue="" className="field-select">
        <option value="">Ziel (optional)</option>
        <option value="verkaufen">Verkaufen</option>
        <option value="kaufen">Kaufen</option>
      </select>
      <select name="berater" defaultValue="" className="field-select">
        <option value="">Berater zuweisen</option>
        {beraterOptions.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <fieldset className="sm:col-span-2" style={{ border: "none", padding: 0, margin: 0 }}>
        <legend className="field-label">Rollen</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5" style={{ marginTop: 4 }}>
          {CUSTOMER_ROLES.map((r) => (
            <label key={r.value} className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
              <input type="checkbox" name="rollen" value={r.value} />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <select name="quelle" defaultValue="" className="field-select sm:col-span-2">
        <option value="">Quelle (optional)</option>
        {LEAD_SOURCE_OPTIONS.map((q) => (
          <option key={q} value={q}>
            {q}
          </option>
        ))}
      </select>
      <textarea name="notes" rows={3} placeholder="Notizen" className="field-textarea sm:col-span-2" />
      {state.error && (
        <p
          className="sm:col-span-2"
          style={{
            fontSize: 13,
            color: "var(--red)",
            border: "1px solid var(--red)",
            borderRadius: "var(--r)",
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--red) 10%, transparent)",
          }}
        >
          ⚠ {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2" style={{ width: "fit-content" }}>
        {pending ? "Wird erfasst…" : "Kunde erfassen"}
      </button>
    </form>
  );
}
