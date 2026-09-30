import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SaleDeadlineBar } from "@/components/admin/SaleDeadlineBar";
import { getListingsForAdmin } from "@/lib/admin-data";
import { saleDeadlineProgress } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Ablaufende Fristen — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminFristenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const listings = await getListingsForAdmin(supabase);
  const relevant = listings
    .filter((l) => l.activated_at && (l.status === "active" || l.status === "reserved"))
    .map((l) => ({ ...l, progress: saleDeadlineProgress(l.activated_at as string, l.sale_deadline_months) }))
    .sort((a, b) => a.progress.remainingDays - b.progress.remainingDays);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ablaufende Fristen</div>
          <div className="page-sub">
            Aktive Inserate nach der 4-Monats-Verkaufsgarantie sortiert — die dringendsten zuerst
          </div>
        </div>
      </div>

      <div className="card">
        {relevant.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎉</div>
            <div className="empty-text">Keine aktiven Fristen</div>
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Objekt</th>
                  <th>Berater</th>
                  <th style={{ minWidth: 220 }}>Frist</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {relevant.map((l) => (
                  <tr key={l.id}>
                    <td className="td-name">
                      {l.title || `${l.address}, ${l.city}`}
                    </td>
                    <td className="td-light">{l.berater || "—"}</td>
                    <td style={{ minWidth: 220 }}>
                      <SaleDeadlineBar activatedAt={l.activated_at} deadlineMonths={l.sale_deadline_months} />
                    </td>
                    <td>
                      <Link href="/admin/inserate" className="btn btn-ghost btn-sm">
                        Zum Inserat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
