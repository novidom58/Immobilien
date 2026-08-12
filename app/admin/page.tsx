import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PasswordSettingsToggle } from "@/components/ui/PasswordSettingsToggle";
import { NewListingForm } from "@/components/admin/NewListingForm";
import { ListingCard } from "@/components/admin/ListingCard";
import { LeadRow } from "@/components/admin/LeadRow";

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

  const [leadsRes, listingsRes, newsletterRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, type, name, email, phone, message, status, wants_financing, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("listings")
      .select(
        "id, title, address, city, postal_code, status, owner_id, price_chf, property_type, rooms, living_area, description, lat, listing_photos(count)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("newsletter_subscribers")
      .select("email, source, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const leads = leadsRes.data ?? [];
  const subscribers = newsletterRes.data ?? [];
  const listings = (listingsRes.data ?? []).map((l) => ({
    id: l.id as string,
    title: (l.title as string | null) ?? null,
    address: l.address as string,
    city: l.city as string,
    postal_code: (l.postal_code as string | null) ?? null,
    status: l.status as string,
    property_type: (l.property_type as string) ?? "Haus",
    price_chf: (l.price_chf as number | null) ?? null,
    rooms: (l.rooms as number | null) ?? null,
    living_area: (l.living_area as number | null) ?? null,
    description: (l.description as string | null) ?? null,
    lat: (l.lat as number | null) ?? null,
    photoCount: (l.listing_photos as { count: number }[] | null)?.[0]?.count ?? 0,
    hasOwner: Boolean(l.owner_id),
  }));

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

        <div className="mt-6">
          <PasswordSettingsToggle />
        </div>

        <section className="mt-8">
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
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Finanzierung</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ivory">
            Newsletter-Abonnenten ({subscribers.length})
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            {subscribers.length === 0 ? (
              <p className="p-6 text-sm text-ivory-dim">Noch keine Anmeldungen.</p>
            ) : (
              <ul className="divide-y divide-line">
                {subscribers.map((s) => (
                  <li key={s.email} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-ivory">{s.email}</span>
                    <span className="font-mono text-xs text-ivory-dim/60">
                      {s.source ?? "—"} · {new Date(s.created_at).toLocaleDateString("de-CH")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ivory">Inserate</h2>
          <div className="mt-4 rounded-2xl border border-line bg-ink-2 p-5">
            <NewListingForm />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {listings.length === 0 ? (
              <p className="rounded-2xl border border-line p-6 text-sm text-ivory-dim">
                Noch keine Inserate.
              </p>
            ) : (
              listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
            )}
          </div>
          <p className="mt-3 text-xs text-ivory-dim/60">
            Kunden per E-Mail-Adresse direkt bei der jeweiligen Objektkarte zuweisen — der
            Kunde muss sich vorher einmal unter /login registriert haben.
          </p>
        </section>
      </div>
    </main>
  );
}
