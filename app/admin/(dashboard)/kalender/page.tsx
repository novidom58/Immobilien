import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { KalenderEmbed } from "@/components/admin/KalenderEmbed";
import { TermineCard } from "@/components/admin/TermineCard";
import { getUpcomingTermine, getCrmCustomers, getBeraterNames } from "@/lib/admin-data";
import { BERATER_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kalender — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKalenderPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [termine, customers, beraterRows] = await Promise.all([
    getUpcomingTermine(supabase),
    getCrmCustomers(supabase),
    getBeraterNames(supabase),
  ]);
  const beraterOptions = beraterRows.length > 0 ? beraterRows.map((b) => b.name) : [...BERATER_OPTIONS];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Kalender</div>
          <div className="page-sub">Eigene Termine, plus dein Outlook- oder Google-Kalender</div>
        </div>
      </div>

      <TermineCard
        termine={termine}
        customers={customers.map((c) => ({ id: c.id, full_name: c.full_name }))}
        beraterOptions={beraterOptions}
      />

      <div className="card-header" style={{ border: "none", padding: "0 0 10px" }}>
        <div className="card-title" style={{ fontSize: 16 }}>
          Outlook- / Google-Kalender
        </div>
      </div>
      <KalenderEmbed />
    </div>
  );
}
