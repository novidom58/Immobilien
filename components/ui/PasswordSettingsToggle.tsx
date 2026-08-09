"use client";

import { useState } from "react";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

export function PasswordSettingsToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-mono text-xs uppercase tracking-wide text-ivory-dim hover:text-ivory"
      >
        Passwort ändern
      </button>
      {open && (
        <div className="mt-4 max-w-sm rounded-xl border border-line bg-ink-2 p-4">
          <ChangePasswordForm onSuccess={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
