import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, BedDouble } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Immobilien",
  description:
    "Aktuelle Immobilien-Angebote von NoviDom Immo in der Region Basel.",
};

export const dynamic = "force-dynamic";

type PublicListing = {
  id: string;
  address: string;
  city: string;
  postal_code: string | null;
  price_chf: number | null;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  active: { label: "Zum Verkauf", classes: "border-amber/50 text-amber-soft" },
  reserved: { label: "Reserviert", classes: "border-blueprint/50 text-blueprint" },
  sold: { label: "Verkauft", classes: "border-line text-ivory-dim/60" },
};

function formatChf(value: number) {
  return `CHF ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

export default async function ImmobilienPage() {
  let listings: PublicListing[] = [];

  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("listings")
      .select("id, address, city, postal_code, price_chf, status, created_at")
      .in("status", ["active", "reserved", "sold"])
      .order("created_at", { ascending: false });
    listings = (data as PublicListing[] | null) ?? [];
  }

  const available = listings.filter((l) => l.status !== "sold");
  const sold = listings.filter((l) => l.status === "sold");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-28 pt-32 lg:px-10">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-blueprint">
          Unsere Objekte
        </span>
        <h1 className="mt-4 max-w-2xl text-balance font-display text-4xl font-semibold leading-tight text-ivory lg:text-5xl">
          Aktuelle <span className="text-amber-soft">Immobilien</span>.
        </h1>

        {available.length === 0 ? (
          <div className="mt-12 max-w-xl rounded-2xl border border-line bg-ink-2 p-8">
            <p className="text-ivory">
              Aktuell sind keine öffentlichen Inserate verfügbar.
            </p>
            <p className="mt-3 text-sm text-ivory-dim">
              Neue Objekte erscheinen hier, sobald sie in die Vermarktung
              starten. Sie möchten Ihre Immobilie verkaufen? Dann könnte Ihr
              Zuhause das nächste Inserat sein.
            </p>
            <Link
              href="/#kontakt"
              className="mt-5 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4"
            >
              Jetzt kostenlose Bewertung sichern
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((listing) => {
              const status = STATUS_LABEL[listing.status] ?? STATUS_LABEL.active;
              return (
                <div
                  key={listing.id}
                  className="group overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40"
                >
                  {/* Platzhalter-Visual bis echte Objektfotos hochgeladen werden */}
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-ink-3 via-ink-2 to-ink">
                    <BedDouble className="h-10 w-10 text-ivory/10" strokeWidth={1} />
                    <span
                      className={`absolute left-4 top-4 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wide ${status.classes}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-ivory-dim">
                      <MapPin className="h-3.5 w-3.5 text-amber" strokeWidth={1.5} />
                      {listing.postal_code ? `${listing.postal_code} ` : ""}
                      {listing.city}
                    </div>
                    <div className="mt-2 font-display text-lg font-semibold text-ivory">
                      {listing.address}
                    </div>
                    <div className="mt-4 font-mono text-amber-soft">
                      {listing.price_chf ? formatChf(listing.price_chf) : "Preis auf Anfrage"}
                    </div>
                    <Link
                      href="/#kontakt"
                      className="mt-5 inline-block font-mono text-xs uppercase tracking-wide text-ivory-dim underline underline-offset-4 group-hover:text-ivory"
                    >
                      Besichtigung anfragen
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sold.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-semibold text-ivory">
              Erfolgreich verkauft
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {sold.map((listing) => (
                <span
                  key={listing.id}
                  className="rounded-full border border-line bg-ink-2 px-4 py-2 text-sm text-ivory-dim"
                >
                  {listing.address}, {listing.city}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
