"use client";

import { useEffect } from "react";

const TARGET = "/reset-password";

/**
 * Landet ein Link aus einer Supabase-Mail auf einer anderen Seite (meist auf
 * der Startseite, wenn die Redirect-URL in Supabase nicht freigegeben ist),
 * leiten wir ihn mitsamt Token an die Passwort-Seite weiter.
 */
export function AuthLinkCatcher() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (pathname.startsWith(TARGET) || pathname.startsWith("/api")) return;
    const query = new URLSearchParams(search);
    const fragment = new URLSearchParams(hash.replace(/^#/, ""));
    const isAuthLink =
      query.has("token_hash") ||
      query.has("error_code") ||
      (query.has("code") && /^[0-9a-f-]{36}$/i.test(query.get("code") ?? "")) ||
      fragment.has("access_token") ||
      fragment.has("error_code");
    if (isAuthLink) window.location.replace(TARGET + search + hash);
  }, []);
  return null;
}
