// HypoCasa (Hypothekenberatung) ist Partner von NoviDom, hat aber einen
// eigenen Auftritt und eigene Daten. Von hier aus geht nur eine Mail an
// HypoCasa, wenn NoviDom-Kunden eine Finanzierung wünschen.

import { createResendClient } from "@/lib/resend";

/** Best-effort; ohne HYPOCASA_LEADS_EMAIL_TO passiert nichts. */
export async function notifyHypoCasa(mail: { subject: string; text: string; replyTo?: string }) {
  const to = process.env.HYPOCASA_LEADS_EMAIL_TO;
  const resend = createResendClient();
  if (!to || !resend) return false;
  const { error } = await resend.emails.send({
    from: process.env.LEADS_EMAIL_FROM || "NoviDom Immo <onboarding@resend.dev>",
    to,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
  });
  return !error;
}
