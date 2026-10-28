"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { archiveLead, deleteLead } from "@/app/admin/actions";

/**
 * Archivieren (Fake, Test, anderweitig erledigt) oder endgültig löschen.
 * Überall dort, wo Leads im Admin auftauchen.
 */
export function LeadArchiveButtons({ leadId, name, archived = false }: { leadId: string; name: string; archived?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<{ error: string | null | undefined }>) {
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (res.error) window.alert(res.error);
    else router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
