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
      <div className="page-header">
        <div>
          <div className="page-title">Registrierte Kunden</div>
          <div className="page-sub">{customers.length} Kund:innen</div>
        </div>
      </div>

      <div className="card">
        {customers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👤</div>
            <div className="empty-text">Noch niemand registriert</div>
            <div className="empty-sub">
              Kund:innen müssen sich zuerst unter /login anmelden, bevor ihr sie einem Inserat zuweisen könnt.
            </div>
          </div>
        ) : (
          <div>
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
          </div>
        )}
      </div>
    </div>
  );
}
