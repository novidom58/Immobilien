"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { updateLeadStatus } from "@/app/admin/actions";
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
  activity: { id: string; type: string; text: string; created_at: string }[];
};

const STATUS_OPTIONS = [
  { value: "neu", label: "Neu" },
  { value: "kontaktiert", label: "Kontaktiert" },
  { value: "termin", label: "Termin vereinbart" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "irrelevant", label: "Irrelevant" },
];

const STATUS_BADGE: Record<string, string> = {
  neu: "badge-blue",
  kontaktiert: "badge-gold",
  termin: "badge-green",
  abgeschlossen: "badge-green-solid",
  irrelevant: "badge-muted",
};

const PARTNER_EMAIL = process.env.NEXT_PUBLIC_PARTNER_REFERRAL_EMAIL;

export function LeadRow({ lead }: { lead: AdminLead }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

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
        `Hallo\n\nDieser Kunde von NoviDom Immo interessiert sich zusätzlich für eine Finanzierungsberatung:\n\nName: ${lead.name}\nE-Mail: ${lead.email}\nTelefon: ${lead.phone || "—"}\n\nNachricht:\n${lead.message || "—"}\n\nFreundliche Grüsse`
      )}`
    : undefined;

  const isOverdue = (lead.status === "neu" || lead.status === "kontaktiert") && lead.daysOpen >= 3;

  return (
    <>
      <tr className={isOverdue ? "termin-offen" : ""}>
        <td className="td-light">{lead.type}</td>
        <td className="td-name">
          {lead.name}
          {isOverdue && (
            <span className="badge badge-red" style={{ marginLeft: 6 }}>
              {lead.daysOpen}T überfällig
            </span>
          )}
          {lead.wants_financing && (
            <span
              title={referralHref ? "An hypotheken-analyse.ch weiterleiten" : "Finanzierungsberatung gewünscht"}
              className="badge badge-blue"
              style={{ marginLeft: 6 }}
            >
              Finanzierung
            </span>
          )}
        </td>
        <td className="td-light">
          {lead.email}
          {lead.phone ? ` · ${lead.phone}` : ""}
        </td>
        <td className="td-light" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
          <select value={lead.status} disabled={busy} onChange={(e) => handleStatus(e.target.value)} className="filter-select">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className={`badge ${STATUS_BADGE[lead.status] ?? "badge-muted"}`} style={{ marginLeft: 8 }}>
            {STATUS_OPTIONS.find((o) => o.value === lead.status)?.label ?? lead.status}
          </span>
        </td>
        <td>
          {lead.wants_financing &&
            (referralHref ? (
              <a href={referralHref} className="btn btn-ghost btn-sm">
                An hypotheken-analyse.ch
              </a>
            ) : (
              <span className="td-light" style={{ fontSize: 11 }}>
                Partner-E-Mail fehlt
              </span>
            ))}
        </td>
        <td>
          <button type="button" onClick={() => setOpen((v) => !v)} className="btn btn-ghost btn-sm">
            Details
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} style={{ background: "var(--bg)", padding: "16px 20px" }}>
            <LeadActivityPanel leadId={lead.id} phone={lead.phone} followUpAt={lead.follow_up_at} activity={lead.activity} />
          </td>
        </tr>
      )}
    </>
  );
}
