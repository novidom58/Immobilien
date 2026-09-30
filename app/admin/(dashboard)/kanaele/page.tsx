import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllLeadsForStats } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Was bringt was — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKanaelePage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const leads = await getAllLeadsForStats(supabase);

  const bySource = new Map<string, { total: number; abgeschlossen: number }>();
  for (const l of leads) {
    const key = l.source || "Unbekannt";
    const entry = bySource.get(key) ?? { total: 0, abgeschlossen: 0 };
    entry.total += 1;
    if (l.status === "abgeschlossen") entry.abgeschlossen += 1;
    bySource.set(key, entry);
  }

  const rows = [...bySource.entries()].sort((a, b) => b[1].total - a[1].total);
  const maxTotal = Math.max(1, ...rows.map(([, v]) => v.total));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Was bringt was</div>
          <div className="page-sub">Leads nach Quelle — wo die Anfragen wirklich herkommen</div>
        </div>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📊</div>
            <div className="empty-text">Noch keine Leads mit Quellen-Angabe</div>
          </div>
        ) : (
          <div style={{ padding: "8px 20px 20px" }}>
            {rows.map(([source, v]) => (
              <div key={source} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  <span>{source}</span>
                  <span className="td-light">
                    {v.total} Lead{v.total === 1 ? "" : "s"}
                    {v.abgeschlossen > 0 && ` · ${v.abgeschlossen} abgeschlossen`}
                  </span>
                </div>
                <div className="crm-progress-track">
                  <div className="crm-progress-fill" style={{ width: `${(v.total / maxTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
