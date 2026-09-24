import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { NewListingForm } from "@/components/admin/NewListingForm";
import { ListingCard } from "@/components/admin/ListingCard";
import { getListingsForAdmin, getCustomers } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Inserate — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminInseratePage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [listings, customers] = await Promise.all([getListingsForAdmin(supabase), getCustomers(supabase)]);
  const customerEmails = customers.filter((c) => c.role !== "admin").map((c) => c.email);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Inserate ({listings.length})</h1>
      <div className="mt-4 rounded-2xl border border-line bg-ink-2 p-5">
        <NewListingForm />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {listings.length === 0 ? (
          <p className="rounded-2xl border border-line p-6 text-sm text-ivory-dim">Noch keine Inserate.</p>
        ) : (
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} customerEmails={customerEmails} />
          ))
        )}
      </div>
      <p className="mt-3 text-xs text-ivory-dim/60">
        Kunden per E-Mail-Adresse direkt bei der jeweiligen Objektkarte zuweisen — der Kunde muss sich
        vorher einmal unter /login registriert haben.
      </p>
    </div>
  );
}
