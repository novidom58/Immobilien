import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";
import { createClient } from "@/lib/supabase/server";
import { publicListingFilter } from "@/lib/offmarket";
import { offerTypeOf, priceText, statusBadge, type OfferType } from "@/lib/listingOffer";

type Listing = {
  id: string;
  title: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  price_chf: number | null;
  status: string;
  offer: OfferType;
  cover: string | null;
};

/**
 * Aktuelle Objekte zum Verkauf und zur Miete. Auf der Verkaufen-Seite mit
 * mehr Objekten und eigenem Titel, damit Eigentümer sehen, was wir vermarkten.
 */
export async function FeaturedListings({ limit = 3, title, accent }: { limit?: number; title?: string; accent?: string } = {}) {
  let listings: Listing[] = [];

  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("listings")
      .select(
        "*, listing_photos(url, sort_order)"
      )
      .in("status", ["active", "reserved", "sold"])
      .or(publicListingFilter())
      .order("created_at", { ascending: false })
      .limit(limit);

    listings = (data ?? []).map((l) => {
      const photos = (l.listing_photos as { url: string; sort_order: number }[] | null) ?? [];
      const cover = photos.length
        ? [...photos].sort((a, b) => a.sort_order - b.sort_order)[0].url
        : null;
      return {
        id: l.id as string,
        title: (l.title as string | null) ?? null,
        address: l.address as string,
        city: l.city as string,
        postal_code: (l.postal_code as string | null) ?? null,
        price_chf: (l.price_chf as number | null) ?? null,
        status: l.status as string,
        offer: offerTypeOf(l.offer_type),
        cover,
      };
    });
  }

  if (listings.length === 0) return null;

  return (
    <section className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>Aktuelle Objekte</SectionLabel>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              {title ?? "Diese Immobilien verkaufen"}
              <br />
              <span className="text-amber-soft">{accent ?? "wir gerade."}</span>
            </h2>
          </div>
          <Link
            href="/immobilien"
            className="font-mono text-xs uppercase tracking-wide text-ivory-dim underline underline-offset-4 hover:text-ivory"
          >
            Alle Immobilien ansehen →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => {
            const status = statusBadge(listing.status, listing.offer);
            return (
              <Reveal key={listing.id} delay={i * 0.08}>
                <Link
                  href={`/immobilien/${listing.id}`}
                  className="group block overflow-hidden rounded-2xl border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40"
                >
                  <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-ink-3 via-ink-2 to-ink">
                    {listing.cover ? (
                      <Image
                        src={listing.cover}
                        alt=""
                        aria-hidden
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <MapPin className="h-10 w-10 text-ivory/10" strokeWidth={1} />
                    )}
                    <span
                      className={`absolute left-4 top-4 rounded-full border bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wide backdrop-blur-sm ${status.classes}`}
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
                      {listing.title || listing.address}
                    </div>
                    <div className="mt-4 font-mono text-amber-soft">
                      {priceText(listing.price_chf, listing.offer)}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
