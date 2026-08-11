"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus } from "@/app/admin/actions";

type AdminLead = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  wants_financing: boolean;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "neu", label: "Neu" },
  { value: "kontaktiert", label: "Kontaktiert" },
  { value: "termin", label: "Termin vereinbart" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "irrelevant", label: "Irrelevant" },
];

const PARTNER_EMAIL = process.env.NEXT_PUBLIC_PARTNER_REFERRAL_EMAIL;

export function LeadRow({ lead }: { lead: AdminLead }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleStatus(status: string) {
    setBusy(true);
    await updateLeadStatus(lead.id, status);
    setBusy(false);
    router.refresh();
  }

  const referralHref = PARTNER_EMAIL
    ? `mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent(
        `Weiterleitung: ${lead.name} benötigt Finanzierungsberatung`
      )}&body=${encodeURIComponent(
        `Hallo\n\nDieser Kunde von NoviDom Immo interessiert sich zusätzlich für eine unabhängige Finanzierungsberatung:\n\nName: ${lead.name}\nE-Mail: ${lead.email}\nTelefon: ${lead.phone || "—"}\n\nNachricht:\n${lead.message || "—"}\n\nFreundliche Grüsse`
      )}`
    : undefined;

  return (
    <tr className="border-t border-line align-top">
      <td className="px-4 py-3 text-amber-soft">{lead.type}</td>
      <td className="px-4 py-3 text-ivory">
        {lead.name}
        {lead.wants_financing && (
          <span
            title={referralHref ? "An hypotheken-analyse.ch weiterleiten" : "Finanzierungsberatung gewünscht"}
            className="ml-2 inline-block rounded-full border border-blueprint/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-blueprint"
          >
            Finanzierung
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-ivory-dim">
        {lead.email}
        {lead.phone ? ` · ${lead.phone}` : ""}
      </td>
      <td className="max-w-xs truncate px-4 py-3 text-ivory-dim">{lead.message}</td>
      <td className="px-4 py-3 text-ivory-dim/60">
        {new Date(lead.created_at).toLocaleDateString("de-CH")}
      </td>
      <td className="px-4 py-3">
        <select
          value={lead.status}
          disabled={busy}
          onChange={(e) => handleStatus(e.target.value)}
          className="rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs text-ivory focus:border-amber focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        {lead.wants_financing &&
          (referralHref ? (
            <a
              href={referralHref}
              className="font-mono text-[11px] uppercase tracking-wide text-amber underline underline-offset-2 hover:text-amber-soft"
            >
              An Partner weiterleiten
            </a>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/40">
              Partner-E-Mail fehlt
            </span>
          ))}
      </td>
    </tr>
  );
}
