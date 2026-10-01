"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/app/admin/actions";

const initialState = { error: null as string | null };

export function CustomerCreateForm({ beraterOptions }: { beraterOptions: string[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const res = await createCustomer(formData);
    if (!res.error) router.push("/admin/kunden");
    return res;
  }, initialState);

  return (
    <form action={formAction} className="grid gap-2.5 sm:grid-cols-2">
      <input name="full_name" required placeholder="Name *" className="field-input sm:col-span-2" />
      <input name="email" type="email" placeholder="E-Mail" className="field-input" />
      <input name="phone" placeholder="Telefon" className="field-input" />
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
      <textarea name="notes" rows={3} placeholder="Notizen" className="field-textarea sm:col-span-2" />
      {state.error && (
        <p className="sm:col-span-2" style={{ fontSize: 13, color: "var(--red)" }}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2" style={{ width: "fit-content" }}>
        {pending ? "Wird erfasst…" : "Kunde erfassen"}
      </button>
    </form>
  );
}
