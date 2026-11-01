"use client";

import { useActionState } from "react";
import { inviteAdmin } from "@/app/admin/actions";

type InviteState = { error: string | null; success: boolean; message?: string };
const initialState: InviteState = { error: null, success: false };

export function AdminInviteForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: InviteState, formData: FormData): Promise<InviteState> => inviteAdmin(formData),
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
          {state.message ?? "Einladung verschickt. Sobald sich die Person anmeldet, hat sie vollen Admin-Zugriff."}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary sm:col-span-2" style={{ width: "fit-content" }}>
        {pending ? "Wird eingeladen…" : "Admin-Zugang einladen"}
      </button>
    </form>
  );
}
