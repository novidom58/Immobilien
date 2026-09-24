import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { PasswordSettingsToggle } from "@/components/ui/PasswordSettingsToggle";
import { NewListingForm } from "@/components/admin/NewListingForm";
import { ListingCard } from "@/components/admin/ListingCard";
import { LeadRow } from "@/components/admin/LeadRow";
import { AcquisitionTool } from "@/components/admin/AcquisitionTool";
import { CustomerRow } from "@/components/admin/CustomerRow";
import { LeadCreateForm } from "@/components/admin/LeadCreateForm";
import { daysSince } from "@/lib/dates";

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

  const [leadsRes, listingsRes, newsletterRes, customersRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, type, name, email, phone, message, status, wants_financing, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("listings")
      .select(
        "id, title, address, city, postal_code, status, owner_id, price_chf, property_type, rooms, living_area, description, tour_url, berater, activated_at, sale_deadline_months, lat, listing_photos(count), listing_documents(id, name, url)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("newsletter_subscribers")
      .select("email, source, created_at")
      .order("created_at", { ascending: false }),
    supabase.rpc("admin_list_customers"),
  ]);

  const leads = (leadsRes.data ?? []).map((l) => ({
    ...l,
    daysOpen: daysSince(l.created_at),
  }));
  const subscribers = newsletterRes.data ?? [];
  const customers = (customersRes.data ?? []) as {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    birthdate: string | null;
    role: string;
    created_at: string;
  }[];
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
    tour_url: (l.tour_url as string | null) ?? null,
    berater: (l.berater as string | null) ?? null,
    activated_at: (l.activated_at as string | null) ?? null,
    sale_deadline_months: (l.sale_deadline_months as number) ?? 4,
    ownerId: (l.owner_id as string | null) ?? null,
    lat: (l.lat as number | null) ?? null,
    photoCount: (l.listing_photos as { count: number }[] | null)?.[0]?.count ?? 0,
    hasOwner: Boolean(l.owner_id),
    documents: (l.listing_documents as { id: string; name: string; url: string }[] | null) ?? [],
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
          <h2 className="font-display text-2xl font-semibold text-ivory">Akquise-E-Mail</h2>
          <p className="mt-2 text-sm text-ivory-dim">
            Objektdaten eintragen, Text wird automatisch erstellt — direkt kopieren oder im
            E-Mail-Programm öffnen.
          </p>
          <div className="mt-4">
            <AcquisitionTool />
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
          <h2 className="font-display text-2xl font-semibold text-ivory">Lead erfassen</h2>
          <p className="mt-2 text-sm text-ivory-dim">
            Für Anfragen, die telefonisch oder persönlich reinkommen, nicht über die Webseite.
          </p>
          <div className="mt-4 rounded-2xl border border-line bg-ink-2 p-5">
            <LeadCreateForm listings={listings.map((l) => ({ id: l.id, label: `${l.address}, ${l.city}` }))} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ivory">
            Registrierte Kunden ({customers.length})
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            {customers.length === 0 ? (
              <p className="p-6 text-sm text-ivory-dim">
                Noch niemand registriert. Kund:innen müssen sich zuerst unter /login anmelden,
                bevor ihr sie einem Inserat zuweisen könnt.
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
              listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  customerEmails={customers.filter((c) => c.role !== "admin").map((c) => c.email)}
                />
              ))
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
