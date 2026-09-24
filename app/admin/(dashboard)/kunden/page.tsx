import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CustomerRow } from "@/components/admin/CustomerRow";
import { getCustomers, getListingsForAdmin } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Kunden — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKundenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [customers, listings] = await Promise.all([getCustomers(supabase), getListingsForAdmin(supabase)]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Registrierte Kunden ({customers.length})</h1>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line">
        {customers.length === 0 ? (
          <p className="p-6 text-sm text-ivory-dim">
            Noch niemand registriert. Kund:innen müssen sich zuerst unter /login anmelden, bevor ihr sie
            einem Inserat zuweisen könnt.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {customers.map((c) => (
              <CustomerRow
                key={c.id}
                customer={c}
                assignedListings={listings
                  .filter((l) => l.ownerId === c.id)
                  .map((l) => ({
                    id: l.id,
                    address: l.address,
                    city: l.city,
                    status: l.status,
                    activated_at: l.activated_at,
                    sale_deadline_months: l.sale_deadline_months,
                    documents: l.documents,
                  }))}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
