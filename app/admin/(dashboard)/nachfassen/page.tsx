import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LeadRow } from "@/components/admin/LeadRow";
import { getLeadsWithActivity, dueTodayLeads, overdueLeads } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Nachfassen — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNachfassenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const leads = await getLeadsWithActivity(supabase);
  const due = dueTodayLeads(leads);
  const overdue = overdueLeads(leads);
  const combined = [...due, ...overdue.filter((l) => !due.some((d) => d.id === l.id))];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Nachfassen ({combined.length})</h1>
      <p className="mt-2 text-sm text-ivory-dim">
        Wiedervorlagen, die heute fällig sind, sowie Leads, die seit 3+ Tagen unbearbeitet offen stehen.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line">
        {combined.length === 0 ? (
          <p className="p-6 text-sm text-ivory-dim">Nichts offen — alles bearbeitet. 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-2 text-xs uppercase tracking-wide text-ivory-dim/60">
                <tr>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Kontakt</th>
                  <th className="px-4 py-3">Nachricht</th>
                  <th className="px-4 py-3">Datum</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Finanzierung</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {combined.map((lead) => (
                  <LeadRow key={lead.id} lead={lead} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
