import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { getLeadsWithActivity, getListingsForAdmin, getNewsletterSubscribers, getCustomers, overdueLeads, dueTodayLeads } from "@/lib/admin-data";

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

  const [leads, listings, subscribers, customers] = await Promise.all([
    getLeadsWithActivity(supabase),
    getListingsForAdmin(supabase),
    getNewsletterSubscribers(supabase),
    getCustomers(supabase),
  ]);

  const nachfassenCount = new Set([...dueTodayLeads(leads), ...overdueLeads(leads)].map((l) => l.id)).size;

  const counts = {
    leads: leads.length,
    nachfassen: nachfassenCount,
    kunden: customers.length,
    newsletter: subscribers.length,
    inserate: listings.length,
  };

  return (
    <AdminShell userEmail={user.email ?? ""} counts={counts}>
      {children}
    </AdminShell>
  );
}
