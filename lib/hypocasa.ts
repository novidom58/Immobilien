// HypoCasa: Hypotheken- und Finanzierungsberatung, Partner von NoviDom Immo.
// Die HypoCasa-Seite läuft im selben Projekt (app/hypocasa) und wird über die
// eigene Domain ausgeliefert (Rewrite in next.config.ts). Finanzierungs-Leads
// aus dem NoviDom-Portal landen zusätzlich direkt im HypoCasa-Postfach.

import { createResendClient } from "@/lib/resend";

export const HYPOCASA_URL = process.env.NEXT_PUBLIC_HYPOCASA_URL || "https://hypocasa.ch";
export const NOVIDOM_URL = "https://www.novidom-immo.ch";

const NOVIDOM_TEAM = process.env.LEADS_EMAIL_TO || "verkaufen@novidom-immo.ch";
// Ohne eigene Adresse gehen HypoCasa-Leads ans NoviDom-Team, damit keiner verloren geht.
export const HYPOCASA_TO = process.env.HYPOCASA_LEADS_EMAIL_TO || NOVIDOM_TEAM;
export const HYPOCASA_FROM =
  process.env.HYPOCASA_EMAIL_FROM || process.env.LEADS_EMAIL_FROM || "HypoCasa <onboarding@resend.dev>";

/** Quellen der Anfragen, die direkt über die HypoCasa-Seite kommen. */
export function isHypoCasaSource(source: string | null | undefined) {
  return !!source && source.startsWith("hypocasa");
}

/**
 * Leitet einen Finanzierungs-Lead an HypoCasa weiter (best-effort). Gibt
 * zurück, ob die Mail rausging. Ist HypoCasa noch nicht separat eingerichtet,
 * erhält das NoviDom-Team sie ohnehin über den normalen Weg, dann entfällt
 * die doppelte Mail.
 */
export async function notifyHypoCasa(mail: { subject: string; text: string; replyTo?: string }) {
  if (!process.env.HYPOCASA_LEADS_EMAIL_TO) return false;
  const resend = createResendClient();
  if (!resend) return false;
  const { error } = await resend.emails.send({
    from: HYPOCASA_FROM,
    to: HYPOCASA_TO,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
  });
  return !error;
}
