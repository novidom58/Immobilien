import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLeadsWithActivity, getListingsForAdmin, getCrmCustomers } from "@/lib/admin-data";
import { saleDeadlineProgress } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Dashboard — Admin",
  robots: { index: false, follow: false },
};

const PIPELINE_STATUS = [
  { value: "neu", label: "Neu" },
  { value: "kontaktiert", label: "Kontaktiert" },
  { value: "termin", label: "Termin vereinbart" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "irrelevant", label: "Irrelevant" },
];

function formatChf(n: number) {
  return `CHF ${Math.round(n).toLocaleString("en-US").replace(/,/g, "'")}`;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [leads, listings, customers] = await Promise.all([
    getLeadsWithActivity(supabase),
    getListingsForAdmin(supabase),
    getCrmCustomers(supabase),
  ]);

  const neueLeads = leads.filter((l) => l.status === "neu");
  const kontaktierteLeads = leads.filter((l) => l.status === "kontaktiert" || l.status === "termin");
  const offeneLeads = leads.filter((l) => l.status !== "abgeschlossen" && l.status !== "irrelevant");
  const bestandskunden = customers.filter((c) => c.typ === "bestand");
  const fristen6Monate = listings.filter((l) => {
    if (!l.activated_at || (l.status !== "active" && l.status !== "reserved")) return false;
    const { remainingDays } = saleDeadlineProgress(l.activated_at, l.sale_deadline_months);
    return remainingDays <= 180;
  });

  const aktiveListings = listings.filter((l) => l.status === "active" || l.status === "reserved");
  const pipelineVolumen = aktiveListings.reduce((sum, l) => sum + (l.price_chf ?? 0), 0);
  const pipelineUmsatz = pipelineVolumen * 0.0095;

  const pipelineCounts = PIPELINE_STATUS.map((s) => ({
    ...s,
    count: leads.filter((l) => l.status === s.value).length,
  }));
  const maxPipeline = Math.max(1, ...pipelineCounts.map((p) => p.count));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Überblick über Leads, Fristen, Kunden und Pipeline-Umsatz</div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi blue">
          <div className="kpi-num">{formatChf(pipelineUmsatz)}</div>
          <div className="kpi-label">Pipeline-Umsatz (geschätzt)</div>
          <div className="kpi-sub">0.95% von {formatChf(pipelineVolumen)} aktivem Volumen</div>
        </div>
        <div className="kpi alert">
          <div className="kpi-num">{neueLeads.length}</div>
          <div className="kpi-label">Neue Leads</div>
          <div className="kpi-sub">Noch nicht kontaktiert</div>
        </div>
        <div className="kpi ok">
          <div className="kpi-num">{kontaktierteLeads.length}</div>
          <div className="kpi-label">Kontaktiert</div>
          <div className="kpi-sub">In Bearbeitung</div>
        </div>
        <div className="kpi warn">
          <div className="kpi-num">{fristen6Monate.length}</div>
          <div className="kpi-label">Frist läuft ab (6 Mt.)</div>
          <div className="kpi-sub">4-Monats-Garantie</div>
        </div>
        <div className="kpi ok">
          <div className="kpi-num">{bestandskunden.length}</div>
          <div className="kpi-label">Bestandskunden</div>
          <div className="kpi-sub">Aktive Verkaufsmandate</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-num">{offeneLeads.length}</div>
          <div className="kpi-label">Offene Leads</div>
          <div className="kpi-sub">Total aktive Leads</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">⚡ Neue Leads — noch nicht kontaktiert</div>
            <div className="card-sub">Bleiben stehen, bis jemand den Status ändert</div>
          </div>
        </div>
        {neueLeads.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            <div className="empty-text">Keine neuen Leads</div>
          </div>
        ) : (
          <div>
            {neueLeads.slice(0, 8).map((l) => (
              <div key={l.id} className="tl-entry" style={{ padding: "12px 20px" }}>
                <div className="tl-icon tl-blue">⚡</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tl-title">{l.name}</div>
                  <div className="tl-meta">
                    {l.email} · {new Date(l.created_at).toLocaleDateString("de-CH")}
                  </div>
                </div>
                <Link href="/admin/leads" className="btn btn-ghost btn-sm">
                  Zu den Leads →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">📊 Pipeline</div>
            <div className="card-sub">Leads nach Status</div>
          </div>
        </div>
        <div style={{ padding: "8px 20px 20px" }}>
          {pipelineCounts.map((p) => (
            <div key={p.value} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                <span>{p.label}</span>
                <span className="td-light">{p.count}</span>
              </div>
              <div className="crm-progress-track">
                <div className="crm-progress-fill" style={{ width: `${(p.count / maxPipeline) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
