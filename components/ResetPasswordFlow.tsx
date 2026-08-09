"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";

type Status = "checking" | "ready" | "invalid";

export function ResetPasswordFlow() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && active) setStatus("ready");
    });

    async function checkSession() {
      const url = new URL(window.location.href);
      if (url.searchParams.get("code")) {
        await supabase!.auth.exchangeCodeForSession(window.location.href).catch(() => null);
      }
      const {
        data: { session },
      } = await supabase!.auth.getSession();
      if (active && session) setStatus("ready");
      else if (active) setTimeout(() => setStatus((s) => (s === "checking" ? "invalid" : s)), 2500);
    }
    checkSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!supabase) {
    return <p className="text-sm text-ivory-dim">Noch nicht eingerichtet.</p>;
  }

  if (status === "checking") {
    return <p className="text-sm text-ivory-dim">Link wird geprüft…</p>;
  }

  if (status === "invalid") {
    return (
      <div className="text-center">
        <p className="text-sm text-ivory-dim">
          Dieser Link ist ungültig oder abgelaufen. Bitte fordere über den Login-Bereich einen
          neuen Reset-Link an.
        </p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/login" className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
            Zum Kundenlogin
          </Link>
          <Link href="/admin/login" className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
            Zum Admin-Login
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-sm text-amber-soft">Passwort erfolgreich geändert.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/login" className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
            Zum Kundenlogin
          </Link>
          <Link href="/admin/login" className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
            Zum Admin-Login
          </Link>
        </div>
      </div>
    );
  }

  return <ChangePasswordForm onSuccess={() => setDone(true)} />;
}
