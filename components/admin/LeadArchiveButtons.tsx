"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Check, Trash2, UserPlus } from "lucide-react";
import { archiveLead, convertLeadToCustomer, deleteLead } from "@/app/admin/actions";
import type { CustomerRole } from "@/lib/constants";

/**
 * Die drei Entscheide zu einem Lead: als Kunde übernehmen, archivieren
 * (Fake, Test, anderweitig erledigt) oder endgültig löschen. Mit
 * `roles` erscheint zusätzlich «Als Kunde» mit den vorgeschlagenen Rollen.
 */
export function LeadArchiveButtons({
  leadId,
  name,
  archived = false,
  roles,
}: {
  leadId: string;
  name: string;
  archived?: boolean;
  roles?: CustomerRole[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [converted, setConverted] = useState(false);

  async function run(action: () => Promise<{ error: string | null | undefined }>) {
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (res.error) window.alert(res.error);
    else router.refresh();
  }

  async function convert() {
    setBusy(true);
    const res = await convertLeadToCustomer(leadId, roles ?? []);
    setBusy(false);
    if (res.error) window.alert(res.error);
    else {
      setConverted(true);
      router.refresh();
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {roles &&
        (converted ? (
          <Link href="/admin/kunden" className="btn btn-gold btn-sm">
            <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
            Im Kundenstamm
          </Link>
        ) : (
          <button type="button" disabled={busy} onClick={convert} className="btn btn-primary btn-sm" title="Als Kunde übernehmen (Rollen lassen sich unter Details anpassen)">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Als Kunde
          </button>
        ))}
      <button
        type="button"
        disabled={busy}
        onClick={() => run(() => archiveLead(leadId, !archived))}
        className="btn btn-ghost btn-sm"
        title={archived ? "Zurück zu den aktiven Leads" : "Fake, Test oder anderweitig erledigt"}
      >
        {archived ? <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />}
        {archived ? "Wiederherstellen" : "Archivieren"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (window.confirm(`Lead «${name}» endgültig löschen? Das lässt sich nicht rückgängig machen.`)) run(() => deleteLead(leadId));
        }}
        className="btn btn-ghost btn-sm"
        style={{ color: "var(--red)" }}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        Löschen
      </button>
    </div>
  );
}
