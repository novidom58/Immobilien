"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Mail, Users, StickyNote, Trash2 } from "lucide-react";
import { updateLeadFollowUp, addLeadActivity, deleteLeadActivity } from "@/app/admin/actions";

type Activity = { id: string; type: string; text: string; created_at: string };

const TYPE_ICON: Record<string, typeof Phone> = {
  email: Mail,
  anruf: Phone,
  besuch: Users,
  notiz: StickyNote,
};

const fieldClasses =
  "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

export function LeadActivityPanel({
  leadId,
  phone,
  followUpAt,
  activity,
}: {
  leadId: string;
  phone: string | null;
  followUpAt: string | null;
  activity: Activity[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
    <div className="grid gap-5 rounded-xl border border-line bg-ink p-4 sm:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-4">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-amber/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-soft hover:bg-amber/10"
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
            Anrufen ({phone})
          </a>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">Wiedervorlage</span>
          <input
            type="date"
            defaultValue={followUpAt ?? ""}
            disabled={busy}
            onChange={(e) => handleFollowUp(e.target.value)}
            className={fieldClasses}
          />
        </label>
      </div>

      <div>
        <div className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">Kontakthistorie</div>
        <form action={handleAddActivity} className="mt-2 flex flex-col gap-2 sm:flex-row">
          <select name="type" defaultValue="notiz" className={`${fieldClasses} sm:w-32`}>
            <option value="notiz">Notiz</option>
            <option value="anruf">Anruf</option>
            <option value="email">E-Mail</option>
            <option value="besuch">Besuch</option>
          </select>
          <input name="text" required placeholder="z.B. Nicht erreicht, morgen nochmal versuchen" className={`${fieldClasses} flex-1`} />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-amber px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink disabled:opacity-60"
          >
            Eintragen
          </button>
        </form>

        {activity.length === 0 ? (
          <p className="mt-3 text-xs text-ivory-dim/50">Noch keine Einträge.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2.5">
            {activity.map((a) => {
              const Icon = TYPE_ICON[a.type] ?? StickyNote;
              return (
                <li key={a.id} className="flex items-start gap-2.5 rounded-lg bg-ink-2 px-3 py-2 text-sm">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" strokeWidth={1.5} />
                  <div className="flex-1">
                    <div className="text-xs text-ivory-dim/50">
                      {new Date(a.created_at).toLocaleString("de-CH")}
                    </div>
                    <div className="text-ivory-dim">{a.text}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    disabled={busy}
                    className="text-ivory-dim/40 hover:text-red-400 disabled:opacity-50"
                    aria-label="Eintrag löschen"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
