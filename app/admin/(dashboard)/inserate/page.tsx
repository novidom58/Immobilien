import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewListingForm } from "@/components/admin/NewListingForm";
import { ListingCard } from "@/components/admin/ListingCard";
import { getListingsForAdmin, getCustomers, getBeraterNames } from "@/lib/admin-data";
import { BERATER_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Inserate — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminInseratePage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [listings, customers, beraterRows] = await Promise.all([
    getListingsForAdmin(supabase),
    getCustomers(supabase),
    getBeraterNames(supabase),
  ]);
  const customerEmails = customers.filter((c) => c.role !== "admin").map((c) => c.email);
  const beraterOptions = beraterRows.length > 0 ? beraterRows.map((b) => b.name) : [...BERATER_OPTIONS];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Inserate</div>
          <div className="page-sub">{listings.length} Objekte</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Neues Inserat</div>
        </div>
        <div style={{ padding: 20 }}>
          <NewListingForm beraterOptions={beraterOptions} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {listings.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">🏠</div>
              <div className="empty-text">Noch keine Inserate</div>
            </div>
          </div>
        ) : (
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} customerEmails={customerEmails} beraterOptions={beraterOptions} />
          ))
        )}
      </div>
      <p className="td-light" style={{ marginTop: 12, fontSize: 11 }}>
        Kunden per E-Mail-Adresse direkt bei der jeweiligen Objektkarte zuweisen — der Kunde muss sich
        vorher einmal unter /login registriert haben.
      </p>
    </div>
  );
}
