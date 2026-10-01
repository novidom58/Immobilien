import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { getLeadsWithActivity, getListingsForAdmin } from "@/lib/admin-data";
import { saleDeadlineProgress } from "@/lib/dates";
import "../admin-crm.css";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center">
        <p className="text-ivory">Admin-Bereich ist noch nicht eingerichtet.</p>
        <Link href="/" className="mt-4 font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
          Zurück zur Startseite
        </Link>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?redirect=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/admin/login");

  const [leads, listings] = await Promise.all([getLeadsWithActivity(supabase), getListingsForAdmin(supabase)]);

  const fristenCount = listings.filter((l) => {
    if (!l.activated_at || (l.status !== "active" && l.status !== "reserved")) return false;
    return saleDeadlineProgress(l.activated_at, l.sale_deadline_months).remainingDays <= 30;
  }).length;

  const counts = {
    leads: leads.length,
    fristen: fristenCount,
  };

  return (
    <AdminShell userEmail={user.email ?? ""} counts={counts}>
      {children}
    </AdminShell>
  );
}
