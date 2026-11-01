// Fehler von Supabase Auth auf Deutsch. Ein leeres «{}» kommt, wenn Supabase
// die Bestätigungs- oder Einladungsmail nicht verschicken kann (SMTP).

type AuthLikeError = { message?: string; status?: number } | null | undefined;

export function authErrorText(error: AuthLikeError, context: "kunde" | "admin" = "kunde") {
  const message = (error?.message ?? "").trim();
  const status = error?.status ?? 0;
  const lower = message.toLowerCase();

  if (!message || message === "{}" || status >= 500 || lower.includes("error sending")) {
    return context === "admin"
      ? "Die E-Mail konnte nicht verschickt werden. Bitte in Supabase die SMTP-Einstellungen (Resend) prüfen: Authentication → Emails → SMTP und Logs → Auth."
      : "Die E-Mail konnte gerade nicht verschickt werden. Bitte versuchen Sie es in ein paar Minuten nochmals oder schreiben Sie uns an verkaufen@novidom-immo.ch.";
  }
  if (status === 429 || lower.includes("rate limit")) return "Zu viele E-Mails in kurzer Zeit. Bitte in einigen Minuten nochmals versuchen.";
  if (lower.includes("already registered") || lower.includes("already been registered")) return "Für diese E-Mail-Adresse gibt es schon ein Konto. Bitte anmelden oder «Passwort vergessen» nutzen.";
  if (lower.includes("invalid login credentials")) return "E-Mail oder Passwort ist falsch.";
  if (lower.includes("email not confirmed")) return "Bitte zuerst den Link in der Bestätigungs-E-Mail anklicken.";
  if (lower.includes("password should be at least")) return "Das Passwort muss mindestens 6 Zeichen haben.";
  if (lower.includes("invalid email") || lower.includes("unable to validate email")) return "Bitte eine gültige E-Mail-Adresse eingeben.";
  return message;
}
