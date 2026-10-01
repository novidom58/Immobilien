import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { KalenderEmbed } from "@/components/admin/KalenderEmbed";
import {
  getLeadsWithActivity,
  getCrmCustomers,
  dueTodayLeads,
  overdueLeads,
  viewingRequestLeads,
  financingRequestLeads,
  dueTodayCustomers,
} from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Heute — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminHeutePage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [leads, customers] = await Promise.all([getLeadsWithActivity(supabase), getCrmCustomers(supabase)]);

  const dueTodayL = dueTodayLeads(leads);
  const overdueL = overdueLeads(leads);
  const attentionLeads = [...dueTodayL, ...overdueL.filter((l) => !dueTodayL.some((d) => d.id === l.id))];
  const attentionCustomers = dueTodayCustomers(customers);
  const besichtigungen = viewingRequestLeads(leads);
  const finanzierungen = financingRequestLeads(leads);
  const neukunden = customers.filter((c) => c.typ === "neukunde");
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
        <Link href="/admin/kunde-erfassen" className="btn btn-primary">
          + Kunde erfassen
        </Link>
      </div>

      <div className="kpi-grid">
        <Link href="/admin/leads" className="kpi blue">
          <div className="kpi-num">{besichtigungen.length}</div>
          <div className="kpi-label">Besichtigungsanfragen</div>
          <div className="kpi-sub">Noch offen</div>
        </Link>
        <Link href="/admin/leads" className="kpi ok">
          <div className="kpi-num">{finanzierungen.length}</div>
          <div className="kpi-label">Finanzierungen angefragt</div>
          <div className="kpi-sub">Noch offen</div>
        </Link>
        <Link href="/admin/kunden" className="kpi warn">
          <div className="kpi-num">{neukunden.length}</div>
          <div className="kpi-label">Neukundengewinnung</div>
          <div className="kpi-sub">Im Trichter, noch kein Bestand</div>
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Was ansteht</div>
            <div className="card-sub">Fällige Wiedervorlagen und überfällige Leads, der dringendste zuerst</div>
          </div>
        </div>
        {attentionLeads.length === 0 && attentionCustomers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-text">Nichts offen</div>
            <div className="empty-sub">Alles bearbeitet.</div>
          </div>
        ) : (
          <div>
            {attentionCustomers.map((c) => (
              <div key={`c-${c.id}`} className="tl-entry" style={{ padding: "12px 20px" }}>
                <div className="tl-icon tl-gold">⏰</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tl-title">{c.full_name}</div>
                  <div className="tl-meta">{c.email || c.phone || "—"} · Wiedervorlage fällig</div>
                </div>
                <Link href="/admin/kunden" className="btn btn-ghost btn-sm">
                  Zu den Kunden →
                </Link>
              </div>
            ))}
            {attentionLeads.map((lead) => {
              const isDueToday = Boolean(lead.follow_up_at && lead.follow_up_at <= todayStr);
              return (
                <div key={lead.id} className={`tl-entry ${!isDueToday ? "termin-offen" : ""}`} style={{ padding: "12px 20px" }}>
                  <div className={`tl-icon ${isDueToday ? "tl-gold" : ""}`} style={!isDueToday ? { background: "rgba(226,87,74,.1)" } : undefined}>
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

      <div className="card-header" style={{ border: "none", padding: "0 0 10px" }}>
        <div className="card-title" style={{ fontSize: 16 }}>
          Kalender
        </div>
      </div>
      <KalenderEmbed />
    </div>
  );
}
