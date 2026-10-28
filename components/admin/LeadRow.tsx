"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { LeadArchiveButtons } from "./LeadArchiveButtons";
import { LEAD_STATUS_OPTIONS, suggestRoles } from "@/lib/constants";
import { LeadActivityPanel } from "./LeadActivityPanel";

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
  daysOpen: number;
  follow_up_at: string | null;
  source: string | null;
  listing_id?: string | null;
  archived_at?: string | null;
  activity: { id: string; type: string; text: string; created_at: string }[];
};

const STATUS_BADGE: Record<string, string> = {
  neu: "badge-blue",
  kontaktiert: "badge-gold",
  termin: "badge-green",
  abgeschlossen: "badge-green-solid",
  irrelevant: "badge-muted",
};

const PARTNER_EMAIL = process.env.NEXT_PUBLIC_PARTNER_REFERRAL_EMAIL;

export function LeadRow({ lead }: { lead: AdminLead }) {
  const [open, setOpen] = useState(false);

  const referralHref = PARTNER_EMAIL
    ? `mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent(
        `Weiterleitung: ${lead.name} benötigt Finanzierungsberatung`
      )}&body=${encodeURIComponent(
        `Hallo\n\nDieser Kunde von NoviDom Immobilien AG interessiert sich zusätzlich für eine Finanzierungsberatung:\n\nName: ${lead.name}\nE-Mail: ${lead.email}\nTelefon: ${lead.phone || "—"}\n\nNachricht:\n${lead.message || "—"}\n\nFreundliche Grüsse`
      )}`
    : undefined;

  const isOverdue = (lead.status === "neu" || lead.status === "kontaktiert") && lead.daysOpen >= 3;
  const roles = suggestRoles({ ...lead, listing_id: lead.listing_id ?? null });

  return (
    <>
      <tr className={isOverdue ? "termin-offen" : ""}>
        <td className="td-name" style={{ minWidth: 190 }}>
          {lead.name}
          <div className="td-light" style={{ fontWeight: 400, marginTop: 2, whiteSpace: "nowrap" }}>
            {lead.email}
            {lead.phone ? ` · ${lead.phone}` : ""}
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
            <span className="badge badge-muted">{lead.type}</span>
            {isOverdue && <span className="badge badge-red">{lead.daysOpen}T überfällig</span>}
            {lead.wants_financing && <span className="badge badge-blue">Finanzierung</span>}
          </div>
        </td>
        <td className="td-light" style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lead.message}
        </td>
        <td className="td-light">
          {new Date(lead.created_at).toLocaleDateString("de-CH")}
          {lead.source && (
            <span className="badge badge-muted" style={{ marginTop: 4, display: "block", width: "fit-content" }}>
              {lead.source}
            </span>
          )}
        </td>
        <td>
          <span className={`badge ${STATUS_BADGE[lead.status] ?? "badge-muted"}`}>
            {LEAD_STATUS_OPTIONS.find((o) => o.value === lead.status)?.label ?? lead.status}
          </span>
        </td>
        <td style={{ minWidth: 300 }}>
          <LeadArchiveButtons leadId={lead.id} name={lead.name} archived={Boolean(lead.archived_at)} roles={roles} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-ghost btn-sm">
              Details
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
            </button>
            {lead.wants_financing && referralHref && (
              <a href={referralHref} className="btn btn-ghost btn-sm" title="An hypotheken-analyse.ch weiterleiten">
                Finanzierung weiterleiten
              </a>
            )}
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} style={{ background: "var(--bg)", padding: "16px 20px" }}>
            <LeadActivityPanel
              leadId={lead.id}
              name={lead.name}
              email={lead.email}
              status={lead.status}
              phone={lead.phone}
              followUpAt={lead.follow_up_at}
              activity={lead.activity}
              suggestedRoles={roles}
              listingId={lead.listing_id ?? null}
            />
          </td>
        </tr>
      )}
    </>
  );
}
