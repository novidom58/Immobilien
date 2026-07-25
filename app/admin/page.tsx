import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { NewListingForm } from "@/components/admin/NewListingForm";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
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

  const [leadsRes, listingsRes] = await Promise.all([
    supabase.from("leads").select("id, type, name, email, phone, message, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("listings").select("id, address, city, status, owner_id, price_chf, lat, lng").order("created_at", { ascending: false }),
  ]);

  const leads = leadsRes.data ?? [];
  const listings = listingsRes.data ?? [];

  return (
    <main className="min-h-svh bg-ink px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ivory">
            Novi<span className="text-amber">Dom</span> <span className="text-ivory-dim">Admin</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden font-sans text-sm text-ivory-dim sm:inline">{user.email}</span>
            <LogoutButton redirectTo="/admin/login" />
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-ivory">Leads</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            {leads.length === 0 ? (
              <p className="p-6 text-sm text-ivory-dim">Noch keine Einsendungen.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-2 text-xs uppercase tracking-wide text-ivory-dim/60">
                  <tr>
                    <th className="px-4 py-3">Typ</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Kontakt</th>
                    <th className="px-4 py-3">Nachricht</th>
                    <th className="px-4 py-3">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-line">
                      <td className="px-4 py-3 text-amber-soft">{lead.type}</td>
                      <td className="px-4 py-3 text-ivory">{lead.name}</td>
                      <td className="px-4 py-3 text-ivory-dim">
                        {lead.email}
                        {lead.phone ? ` · ${lead.phone}` : ""}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-ivory-dim">{lead.message}</td>
                      <td className="px-4 py-3 text-ivory-dim/60">
                        {new Date(lead.created_at).toLocaleDateString("de-CH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ivory">Inserate</h2>
          <div className="mt-4 rounded-2xl border border-line bg-ink-2 p-5">
            <NewListingForm />
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            {listings.length === 0 ? (
              <p className="p-6 text-sm text-ivory-dim">Noch keine Inserate.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-2 text-xs uppercase tracking-wide text-ivory-dim/60">
                  <tr>
                    <th className="px-4 py-3">Adresse</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Preis</th>
                    <th className="px-4 py-3">Auf Karte</th>
                    <th className="px-4 py-3">Kunde verknüpft</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-t border-line">
                      <td className="px-4 py-3 text-ivory">
                        {listing.address}, {listing.city}
                      </td>
                      <td className="px-4 py-3 text-amber-soft">{listing.status}</td>
                      <td className="px-4 py-3 text-ivory-dim">
                        {listing.price_chf ? `CHF ${listing.price_chf.toLocaleString("de-CH")}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-ivory-dim/60">
                        {listing.lat && listing.lng ? "Ja" : "Nein — manuell setzen"}
                      </td>
                      <td className="px-4 py-3 text-ivory-dim/60">{listing.owner_id ? "Ja" : "Nein"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="mt-3 text-xs text-ivory-dim/60">
            Um ein Inserat mit einem Kundenkonto zu verknüpfen, im Supabase Table Editor bei der
            Tabelle „listings“ das Feld „owner_id“ auf die User-ID des Kunden setzen (unter
            Authentication → Users zu finden).
          </p>
        </section>
      </div>
    </main>
  );
}
