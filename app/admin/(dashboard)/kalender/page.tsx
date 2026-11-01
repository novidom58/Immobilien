import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { KalenderEmbed } from "@/components/admin/KalenderEmbed";
import { CalendarView } from "@/components/admin/CalendarView";
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
          <div className="page-sub">Firmenkalender (Hostpoint, Cal.com-Buchungen) und CRM-Termine</div>
        </div>
      </div>

      <CalendarView
        shared={Boolean(process.env.KALENDER_ICS_URL || process.env.KALENDER_CALDAV_URL)}
        termine={termine.map((t) => ({ id: t.id, title: t.title, typeLabel: t.typeLabel, starts_at: t.starts_at, customerName: t.customerName }))}
      />

      <div style={{ marginTop: 20 }}>
        <TermineCard
          termine={termine}
          customers={customers.map((c) => ({ id: c.id, full_name: c.full_name }))}
          beraterOptions={beraterOptions}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <KalenderEmbed shared={Boolean(process.env.KALENDER_ICS_URL || process.env.KALENDER_CALDAV_URL)} />
      </div>
    </div>
  );
}
