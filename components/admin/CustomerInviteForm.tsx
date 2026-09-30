"use client";

import { useActionState } from "react";
import { inviteCustomer } from "@/app/admin/actions";

const initialState = { error: null as string | null, success: false };

export function CustomerInviteForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => inviteCustomer(formData),
    initialState
  );

  return (
    <form action={formAction} className="grid gap-2.5 sm:grid-cols-2">
      <input name="full_name" placeholder="Name" className="field-input" />
      <input name="email" type="email" required placeholder="E-Mail *" className="field-input" />
      {state.error && (
        <p className="sm:col-span-2" style={{ fontSize: 13, color: "var(--red)" }}>
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="sm:col-span-2" style={{ fontSize: 13, color: "var(--green)" }}>
          Einladung verschickt.
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2" style={{ width: "fit-content" }}>
        {pending ? "Wird eingeladen…" : "Einladung senden"}
      </button>
    </form>
  );
}
