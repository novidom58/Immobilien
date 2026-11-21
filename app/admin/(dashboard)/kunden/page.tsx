import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CustomerList } from "@/components/admin/CustomerList";
import { getCrmCustomers, getListingsForAdmin, getBeraterNames, getCustomers } from "@/lib/admin-data";
import { PortalAccounts } from "@/components/admin/PortalAccounts";
import { BERATER_OPTIONS } from "@/lib/constants";
import { findDuplicates } from "@/lib/duplicates";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kunden — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKundenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [customers, listings, beraterRows, accounts] = await Promise.all([
    getCrmCustomers(supabase),
    getListingsForAdmin(supabase),
    getBeraterNames(supabase),
    getCustomers(supabase),
  ]);
  // Website-Konten ohne CRM-Eintrag (weder verknüpft noch gleiche E-Mail)
  const linked = new Set(customers.map((c) => c.portal_user_id).filter(Boolean));
  const emails = new Set(customers.map((c) => c.email?.toLowerCase()).filter(Boolean));
  const newAccounts = accounts.filter((a) => a.role !== "admin" && !linked.has(a.id) && !emails.has(a.email.toLowerCase()));
  const beraterOptions = beraterRows.length > 0 ? beraterRows.map((b) => b.name) : [...BERATER_OPTIONS];
  const doppelte = findDuplicates(customers).length;

  return (
    <CustomerList
      customers={customers}
      listings={listings}
      beraterOptions={beraterOptions}
      topSlot={
        <>
          {doppelte > 0 && (
            <Link href="/admin/kunden/doppelte" className="card" style={{ display: "block", padding: "12px 16px", marginBottom: 12, fontSize: 13, borderColor: "rgba(199,138,58,.45)" }}>
              ⚠️ {doppelte} {doppelte === 1 ? "mögliche doppelte Person" : "mögliche doppelte Personen"} gefunden. <strong>Prüfen und zusammenführen →</strong>
            </Link>
          )}
          <PortalAccounts accounts={newAccounts} />
        </>
      }
    />
  );
}
