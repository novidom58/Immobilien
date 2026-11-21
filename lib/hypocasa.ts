// HypoCasa (Hypotheken und Versicherungen) ist Partner von NoviDom, hat aber einen
// eigenen Auftritt und ein eigenes CRM. Leads gehen nur dorthin, wenn die Kundin oder
// der Kunde der Weitergabe zugestimmt hat (Häkchen im Formular).

import { createResendClient } from "@/lib/resend";

export type HypoCasaThema = "finanzierung" | "verlaengerung" | "versicherung";

export type HypoCasaLead = {
  thema: HypoCasaThema;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  /** Woher bei NoviDom, z.B. «kontaktformular», «wertmonitor» */
  quelle?: string;
  /** Ablauf der Hypothek (JJJJ-MM-TT) */
  ablauf?: string | null;
  betrag?: number | null;
};

const ANLIEGEN: Record<HypoCasaThema, string> = {
  finanzierung: "Kauf",
  verlaengerung: "Verlängerung",
  versicherung: "Versicherung",
};

/**
 * Schickt den Lead direkt ins HypoCasa-CRM (HYPOCASA_API_URL + HYPOCASA_API_KEY).
 * Ist die Schnittstelle nicht eingerichtet oder nicht erreichbar, geht er wie
 * bisher per Mail an HYPOCASA_LEADS_EMAIL_TO. Best-effort, wirft nie.
 */
export async function sendToHypoCasa(lead: HypoCasaLead): Promise<boolean> {
  const url = process.env.HYPOCASA_API_URL;
  const key = process.env.HYPOCASA_API_KEY;
  const [vorname, ...rest] = lead.name.trim().split(/\s+/);

  if (url && key) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-HC-Key": key },
        body: JSON.stringify({
          formular: "NoviDom",
          anliegen: ANLIEGEN[lead.thema],
          vorname: vorname || lead.name,
          nachname: rest.join(" ") || "–",
          email: lead.email,
          mobil: lead.phone ?? "",
          ablauf: lead.ablauf ?? undefined,
          betrag: lead.betrag ?? undefined,
          quelle: `novidom-${lead.quelle ?? "website"}`.slice(0, 60),
          einwilligung: true,
          message: lead.message ?? "",
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return true;
    } catch {
      // weiter mit der Mail
    }
  }

  const titel = { finanzierung: "Finanzierungs", verlaengerung: "Verlängerungs", versicherung: "Versicherungs" }[lead.thema];
  return notifyHypoCasa({
    replyTo: lead.email,
    subject: `${titel}-Lead von NoviDom: ${lead.name}`,
    text: [
      `Name: ${lead.name}`,
      `E-Mail: ${lead.email}`,
      `Telefon: ${lead.phone || "—"}`,
      lead.ablauf ? `Hypothek läuft ab: ${new Date(lead.ablauf).toLocaleDateString("de-CH")}` : null,
      `Quelle: NoviDom ${lead.quelle ?? ""}`,
      "Einwilligung zur Weitergabe: ja",
      "",
      lead.message || "—",
    ]
      .filter((l) => l !== null)
      .join("\n"),
  }).catch(() => false);
}

/** Mail an HypoCasa (Rückfallebene). Ohne HYPOCASA_LEADS_EMAIL_TO passiert nichts. */
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
