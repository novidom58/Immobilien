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

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Heute</h1>
      <p className="mt-1 text-sm text-ivory-dim">
        {new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/nachfassen"
          className="rounded-2xl border border-line bg-ink-2 p-5 transition-colors hover:border-amber/40"
        >
          <div className="font-display text-3xl font-semibold text-amber">{dueToday.length}</div>
          <div className="mt-1 text-sm text-ivory-dim">Wiedervorlagen fällig</div>
        </Link>
        <Link
          href="/admin/nachfassen"
          className="rounded-2xl border border-line bg-ink-2 p-5 transition-colors hover:border-red-400/40"
        >
          <div className="font-display text-3xl font-semibold text-red-400">{overdue.length}</div>
          <div className="mt-1 text-sm text-ivory-dim">Leads überfällig (Nachfassen)</div>
        </Link>
        <Link
          href="/admin/leads"
          className="rounded-2xl border border-line bg-ink-2 p-5 transition-colors hover:border-blueprint/40"
        >
          <div className="font-display text-3xl font-semibold text-blueprint">{viewingRequests.length}</div>
          <div className="mt-1 text-sm text-ivory-dim">Offene Objekt-Anfragen</div>
        </Link>
      </div>
      <p className="mt-3 text-xs text-ivory-dim/50">
        Kein Kalender-Abgleich — Cal.com-Termine erscheinen hier nicht automatisch, nur was bei den
        Leads als Wiedervorlage gesetzt ist.
      </p>

      {(dueToday.length > 0 || overdue.length > 0) && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ivory">Was ansteht</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line">
            <ul className="divide-y divide-line">
              {[...dueToday, ...overdue.filter((l) => !dueToday.some((d) => d.id === l.id))].map((lead) => (
                <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <span className="text-ivory">{lead.name}</span>
                  <span className="text-ivory-dim">{lead.email}</span>
                  {lead.follow_up_at && lead.follow_up_at <= new Date().toISOString().slice(0, 10) ? (
                    <span className="rounded-full border border-amber/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-soft">
                      Wiedervorlage fällig
                    </span>
                  ) : (
                    <span className="rounded-full border border-red-400/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-red-400">
                      {lead.daysOpen} Tage überfällig
                    </span>
                  )}
                  <Link href="/admin/leads" className="font-mono text-[11px] uppercase tracking-wide text-amber underline underline-offset-2">
                    Zu den Leads →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
