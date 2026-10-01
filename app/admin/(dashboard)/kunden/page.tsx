import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CustomerList } from "@/components/admin/CustomerList";
import { getCrmCustomers, getListingsForAdmin, getBeraterNames } from "@/lib/admin-data";
import { BERATER_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kunden — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKundenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [customers, listings, beraterRows] = await Promise.all([
    getCrmCustomers(supabase),
    getListingsForAdmin(supabase),
    getBeraterNames(supabase),
  ]);
  const beraterOptions = beraterRows.length > 0 ? beraterRows.map((b) => b.name) : [...BERATER_OPTIONS];

  return (
    <CustomerList
      customers={customers}
      listings={listings.map((l) => ({ id: l.id, address: l.address, city: l.city, status: l.status }))}
      beraterOptions={beraterOptions}
    />
  );
}
