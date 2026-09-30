import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLeadsWithActivity, dueTodayLeads, overdueLeads, viewingRequestLeads } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Heute — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminHeutePage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const leads = await getLeadsWithActivity(supabase);
  const dueToday = dueTodayLeads(leads);
  const overdue = overdueLeads(leads);
  const viewingRequests = viewingRequestLeads(leads);
  const attention = [...dueToday, ...overdue.filter((l) => !dueToday.some((d) => d.id === l.id))];
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Heute</div>
          <div className="page-sub">
            {new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
        <Link href="/admin/erfassen" className="btn btn-primary">
          + Lead erfassen
        </Link>
      </div>

      <div className="kpi-grid">
        <Link href="/admin/nachfassen" className="kpi warn">
          <div className="kpi-num">{dueToday.length}</div>
          <div className="kpi-label">Wiedervorlagen fällig</div>
          <div className="kpi-sub">Heute dran</div>
        </Link>
        <Link href="/admin/nachfassen" className="kpi alert">
          <div className="kpi-num">{overdue.length}</div>
          <div className="kpi-label">Leads überfällig</div>
          <div className="kpi-sub">Seit 3+ Tagen offen</div>
        </Link>
        <Link href="/admin/leads" className="kpi blue">
          <div className="kpi-num">{viewingRequests.length}</div>
          <div className="kpi-label">Offene Objekt-Anfragen</div>
          <div className="kpi-sub">Noch nicht abgeschlossen</div>
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Was ansteht</div>
            <div className="card-sub">Fällige Wiedervorlagen und überfällige Leads, der dringendste zuerst</div>
          </div>
        </div>
        {attention.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-text">Nichts offen</div>
            <div className="empty-sub">Alles bearbeitet.</div>
          </div>
        ) : (
          <div>
            {attention.map((lead) => {
              const isDueToday = Boolean(lead.follow_up_at && lead.follow_up_at <= todayStr);
              return (
                <div key={lead.id} className={`tl-entry ${!isDueToday ? "termin-offen" : ""}`} style={{ padding: "12px 20px" }}>
                  <div className={`tl-icon ${isDueToday ? "tl-gold" : ""}`} style={!isDueToday ? { background: "rgba(192,57,43,.1)" } : undefined}>
                    {isDueToday ? "⏰" : "📨"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tl-title">{lead.name}</div>
                    <div className="tl-meta">
                      {lead.email}
                      {isDueToday ? " · Wiedervorlage fällig" : ` · ${lead.daysOpen} Tage überfällig`}
                    </div>
                  </div>
                  <Link href="/admin/leads" className="btn btn-ghost btn-sm">
                    Zu den Leads →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
