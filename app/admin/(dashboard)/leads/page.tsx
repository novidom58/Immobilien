import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LeadRow } from "@/components/admin/LeadRow";
import { getLeadsWithActivity } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Leads — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<{ ansicht?: string }> }) {
  const { ansicht } = await searchParams;
  const archiv = ansicht === "archiv";
  const supabase = await createClient();
  if (!supabase) return null;

  const leads = await getLeadsWithActivity(supabase, { archived: archiv });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{archiv ? "Archivierte Leads" : "Leads"}</div>
          <div className="page-sub">
            {leads.length} {archiv ? "im Archiv · Fakes, Tests und anderweitig Erledigtes" : "Einsendungen · Fakes und Tests über das Archiv-Symbol ausblenden"}
          </div>
        </div>
        <Link href={archiv ? "/admin/leads" : "/admin/leads?ansicht=archiv"} className="btn btn-ghost btn-sm">
          {archiv ? "← Aktive Leads" : "Archiv ansehen"}
        </Link>
      </div>

      <div className="card">
        {leads.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">{archiv ? "Archiv ist leer" : "Noch keine Einsendungen"}</div>
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name &amp; Kontakt</th>
                  <th>Nachricht</th>
                  <th>Eingang</th>
                  <th>Status</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
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
