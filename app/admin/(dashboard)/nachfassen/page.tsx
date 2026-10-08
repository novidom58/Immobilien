import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LeadRow } from "@/components/admin/LeadRow";
import { DueCustomerTable } from "@/components/admin/DueCustomerTable";
import {
  getLeadsWithActivity,
  dueTodayLeads,
  overdueLeads,
  getCrmCustomers,
  dueTodayCustomers,
  getListingsForAdmin,
  getBeraterNames,
} from "@/lib/admin-data";
import { BERATER_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Nachfassen — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNachfassenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [leads, customers, listings, beraterRows] = await Promise.all([
    getLeadsWithActivity(supabase),
    getCrmCustomers(supabase),
    getListingsForAdmin(supabase),
    getBeraterNames(supabase),
  ]);
  const due = dueTodayLeads(leads);
  const overdue = overdueLeads(leads);
  const combined = [...due, ...overdue.filter((l) => !due.some((d) => d.id === l.id))];
  const dueCustomers = dueTodayCustomers(customers).sort((a, b) => (a.follow_up_at ?? "").localeCompare(b.follow_up_at ?? ""));
  const beraterOptions = beraterRows.length > 0 ? beraterRows.map((b) => b.name) : [...BERATER_OPTIONS];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Nachfassen</div>
          <div className="page-sub">
            Fällige Wiedervorlagen bei Kunden und Leads sowie seit 3+ Tagen offene Leads. Mit «Mail aus Vorlage» wird gleich die nächste Wiedervorlage gesetzt.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Kunden ({dueCustomers.length})</div>
            <div className="card-sub">Wiedervorlage heute oder überfällig</div>
          </div>
        </div>
        {dueCustomers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-text">Keine Kunden fällig</div>
          </div>
        ) : (
          <DueCustomerTable customers={dueCustomers} listings={listings} beraterOptions={beraterOptions} />
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Leads ({combined.length})</div>
            <div className="card-sub">Wiedervorlage fällig oder seit 3+ Tagen offen</div>
          </div>
        </div>
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
