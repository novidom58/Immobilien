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
      <div className="page-header">
        <div>
          <div className="page-title">Nachfassen</div>
          <div className="page-sub">Wiedervorlagen, die heute fällig sind, sowie seit 3+ Tagen offene Leads</div>
        </div>
      </div>

      <div className="card">
        {combined.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-text">Nichts offen</div>
            <div className="empty-sub">Alles bearbeitet.</div>
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Typ</th>
                  <th>Name</th>
                  <th>Kontakt</th>
                  <th>Nachricht</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Finanzierung</th>
                  <th>Details</th>
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
