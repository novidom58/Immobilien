"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Users, StickyNote, Trash2 } from "lucide-react";
import { updateLeadStatus, updateLeadFollowUp, addLeadActivity, deleteLeadActivity } from "@/app/admin/actions";
import { LEAD_STATUS_OPTIONS } from "@/lib/constants";

type Activity = { id: string; type: string; text: string; created_at: string };

const TYPE_ICON: Record<string, typeof Phone> = {
  email: Mail,
  anruf: Phone,
  besuch: Users,
  notiz: StickyNote,
};

const TYPE_TONE: Record<string, string> = {
  email: "tl-blue",
  anruf: "tl-green",
  besuch: "tl-gold",
  notiz: "",
};

export function LeadActivityPanel({
  leadId,
  status,
  phone,
  followUpAt,
  activity,
}: {
  leadId: string;
  status: string;
  phone: string | null;
  followUpAt: string | null;
  activity: Activity[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleStatus(newStatus: string) {
    setBusy(true);
    await updateLeadStatus(leadId, newStatus);
    setBusy(false);
    router.refresh();
  }

  async function handleFollowUp(date: string) {
    setBusy(true);
    await updateLeadFollowUp(leadId, date);
    setBusy(false);
    router.refresh();
  }

  async function handleAddActivity(formData: FormData) {
    setBusy(true);
    await addLeadActivity(leadId, formData);
    setBusy(false);
    router.refresh();
  }

  async function handleDelete(activityId: string) {
    setBusy(true);
    await deleteLeadActivity(activityId);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-3">
        {phone && (
          <a href={`tel:${phone}`} className="btn btn-primary btn-sm" style={{ justifyContent: "center" }}>
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
            Anrufen ({phone})
          </a>
        )}
        <label className="field-group">
          <span className="field-label">Status</span>
          <select value={status} disabled={busy} onChange={(e) => handleStatus(e.target.value)} className="field-select">
            {LEAD_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-group">
          <span className="field-label">Wiedervorlage</span>
          <input
            type="date"
            defaultValue={followUpAt ?? ""}
            disabled={busy}
            onChange={(e) => handleFollowUp(e.target.value)}
            className="field-input"
          />
        </label>
      </div>

      <div>
        <div className="detail-label">Kontakthistorie</div>
        <form action={handleAddActivity} className="mt-2 flex flex-col gap-2 sm:flex-row">
          <select name="type" defaultValue="notiz" className="field-select" style={{ width: "auto" }}>
            <option value="notiz">Notiz</option>
            <option value="anruf">Anruf</option>
            <option value="email">E-Mail</option>
            <option value="besuch">Besuch</option>
          </select>
          <input name="text" required placeholder="z.B. Nicht erreicht, morgen nochmal versuchen" className="field-input" style={{ flex: 1 }} />
          <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
            Eintragen
          </button>
        </form>

        {activity.length === 0 ? (
          <p className="td-light" style={{ marginTop: 12, fontSize: 12 }}>
            Noch keine Einträge.
          </p>
        ) : (
          <div className="mt-2">
            {activity.map((a) => {
              const Icon = TYPE_ICON[a.type] ?? StickyNote;
              return (
                <div key={a.id} className="tl-entry">
                  <div className={`tl-icon ${TYPE_TONE[a.type] ?? ""}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tl-title">{a.text}</div>
                    <div className="tl-meta">{new Date(a.created_at).toLocaleString("de-CH")}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    disabled={busy}
                    aria-label="Eintrag löschen"
                    style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer" }}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
