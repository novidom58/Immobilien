import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, BedDouble, Ruler, Home } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; classes: string }> = {
  active: { label: "Zum Verkauf", classes: "border-amber/50 text-amber-soft" },
  reserved: { label: "Reserviert", classes: "border-blueprint/50 text-blueprint" },
  sold: { label: "Verkauft", classes: "border-line text-ivory-dim/60" },
};

function formatChf(value: number) {
  return `CHF ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

async function getListing(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, address, city, postal_code, price_chf, status, property_type, rooms, living_area, description, listing_photos(url, sort_order)"
    )
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle();

  if (!data) return null;

  const photos = ((data.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return { ...data, photos } as typeof data & { photos: typeof photos };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Immobilie nicht gefunden" };
  return {
    title: listing.title || `${listing.address}, ${listing.city}`,
    description: listing.description || `Immobilie in ${listing.city} — vermittelt von NoviDom Immo.`,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const status = STATUS_LABEL[listing.status] ?? STATUS_LABEL.active;
  const [main, ...rest] = listing.photos;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-28 pt-32 lg:px-10">
        <Link
          href="/immobilien"
          className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
        >
          ← Alle Immobilien
        </Link>

        {/* Galerie */}
        <div className="mt-6">
          {main ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ink-2">
              <Image
                src={main.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 1000px, 100vw"
                priority
                className="object-cover"
              />
              <span
                className={`absolute left-5 top-5 rounded-full border bg-ink/80 px-3 py-1.5 font-mono text-xs uppercase tracking-wide backdrop-blur-sm ${status.classes}`}
              >
                {status.label}
              </span>
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-ink-3 via-ink-2 to-ink">
              <Home className="h-16 w-16 text-ivory/10" strokeWidth={1} />
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {rest.map((photo) => (
                <div key={photo.url} className="relative aspect-square overflow-hidden rounded-xl bg-ink-2">
                  <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kopf */}
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex items-center gap-2 text-sm text-ivory-dim">
              <MapPin className="h-4 w-4 text-amber" strokeWidth={1.5} />
              {listing.postal_code ? `${listing.postal_code} ` : ""}
              {listing.city}
            </div>
            <h1 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-4xl">
              {listing.title || listing.address}
            </h1>
            <p className="mt-1 text-ivory-dim">{listing.address}</p>

            <div className="mt-6 flex flex-wrap gap-6 border-y border-line py-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-ivory-dim/60">Typ</div>
                <div className="mt-1 text-ivory">{listing.property_type || "—"}</div>
              </div>
              {listing.rooms && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-ivory-dim/60">Zimmer</div>
                  <div className="mt-1 flex items-center gap-1.5 text-ivory">
                    <BedDouble className="h-4 w-4 text-amber" strokeWidth={1.5} />
                    {listing.rooms}
                  </div>
                </div>
              )}
              {listing.living_area && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-ivory-dim/60">Wohnfläche</div>
                  <div className="mt-1 flex items-center gap-1.5 text-ivory">
                    <Ruler className="h-4 w-4 text-amber" strokeWidth={1.5} />
                    {listing.living_area} m²
                  </div>
                </div>
              )}
            </div>

            {listing.description && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-semibold text-ivory">Beschreibung</h2>
                <p className="mt-3 max-w-2xl whitespace-pre-line text-balance leading-relaxed text-ivory-dim">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* CTA-Karte */}
          <div className="h-fit rounded-2xl border border-line bg-ink-2 p-7">
            <div className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
              Verkaufspreis
            </div>
            <div className="mt-2 font-display text-3xl font-semibold text-amber-soft">
              {listing.price_chf ? formatChf(listing.price_chf) : "Auf Anfrage"}
            </div>
            <div className="mt-6">
              <MagneticButton href="/#kontakt" className="w-full justify-center">
                Besichtigung anfragen
              </MagneticButton>
            </div>
            <p className="mt-4 text-xs text-ivory-dim/60">
              Persönliche Auskunft durch Jana Schnuderl, NoviDom Immo.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
