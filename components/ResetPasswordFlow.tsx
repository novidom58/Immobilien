"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ForgotPassword } from "@/components/ForgotPassword";

type Status = "checking" | "password" | "confirmed" | "invalid";

const PASSWORD_TYPES = new Set(["recovery", "invite"]);

/**
 * Nimmt jeden Link aus den Supabase-Mails entgegen, egal in welcher Form:
 * - ?token_hash=…&type=…  (empfohlene Mailvorlage, klappt auch auf einem anderen Gerät)
 * - ?code=…               (PKCE, nur im gleichen Browser, in dem der Link angefordert wurde)
 * - #access_token=…       (Einladung über die Admin-API)
 * - ?error_code=… / #error_code=…  (Link abgelaufen oder schon benutzt)
 */
export function ResetPasswordFlow() {
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const client = supabase;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && active) setStatus("password");
    });

    async function run() {
      const url = new URL(window.location.href);
      const query = url.searchParams;
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const get = (key: string) => query.get(key) ?? hash.get(key);
      const type = get("type") ?? "";
      const wantsPassword = PASSWORD_TYPES.has(type);

      const errorCode = get("error_code");
      if (errorCode || get("error_description")) {
        setProblem(
          errorCode === "otp_expired"
            ? "Dieser Link ist abgelaufen oder wurde schon benutzt. Manche Mailprogramme öffnen Links automatisch zur Prüfung, dann ist er verbraucht."
            : get("error_description") ?? "Der Link konnte nicht geprüft werden."
        );
        setStatus("invalid");
        return;
      }

      let ok = false;
      const recovery = wantsPassword;
      const tokenHash = query.get("token_hash");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = query.get("code");

      if (tokenHash) {
        const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: (type || "email") as EmailOtpType });
        ok = !error;
        if (error) setProblem("Dieser Link ist abgelaufen oder wurde schon benutzt.");
      } else if (accessToken && refreshToken) {
        const { error } = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        ok = !error;
      } else if (code) {
        // Ohne type ist es ein Reset-Link: unten führt das zum Passwortformular
        const { error } = await client.auth.exchangeCodeForSession(code).catch(() => ({ error: true }));
        ok = !error;
      }

      // Link entfernen, damit ein Neuladen ihn nicht nochmals verbraucht
      if (tokenHash || accessToken || code) window.history.replaceState(null, "", url.pathname);

      if (!ok) {
        const { data } = await client.auth.getSession();
        ok = Boolean(data.session);
      }
      if (!active) return;
      if (!ok) {
        setStatus("invalid");
        return;
      }
      setStatus((s) => (s === "password" ? s : recovery || !type ? "password" : "confirmed"));
    }
    run();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!supabase) {
    return <p className="text-sm text-ivory-dim">Noch nicht eingerichtet.</p>;
  }

  const links = (
    <div className="mt-4 flex justify-center gap-6">
      <Link href="/login" className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
        Zum Kundenlogin
      </Link>
      <Link href="/admin/login" className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
        Zum Admin-Login
      </Link>
    </div>
  );

  if (status === "checking") {
    return <p className="text-center text-sm text-ivory-dim">Link wird geprüft…</p>;
  }

  if (status === "invalid") {
    return (
      <div>
        <p className="text-center text-sm text-ivory-dim">
          {problem ?? "Dieser Link ist ungültig oder abgelaufen."} Fordern Sie hier einfach einen neuen Link an und
          öffnen Sie ihn im gleichen Browser.
        </p>
        <div className="mt-5 flex justify-center">
          <ForgotPassword />
        </div>
        {links}
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="text-center">
        <p className="text-sm text-amber-soft">Ihre E-Mail-Adresse ist bestätigt, Sie sind angemeldet.</p>
        {links}
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-sm text-amber-soft">Passwort gespeichert. Sie sind angemeldet.</p>
        {links}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-5 text-center text-sm text-ivory-dim">Wählen Sie ein Passwort mit mindestens 6 Zeichen.</p>
      <ChangePasswordForm onSuccess={() => setDone(true)} />
    </div>
  );
}
