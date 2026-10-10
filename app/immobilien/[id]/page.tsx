import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, BedDouble, Ruler, Home } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingViewingRequest } from "@/components/ListingViewingRequest";
import { ListingTour } from "@/components/ListingTour";
import { ListingFlythrough } from "@/components/listing/ListingFlythrough";
import { createClient } from "@/lib/supabase/server";
import { CLIP_BUCKET, clipFolder, flightFolder, flightLabel, isClipFile } from "@/lib/listingClips";
import { DroneFlight } from "@/components/listing/DroneFlight";
import { ContactChannels } from "@/components/listing/ContactChannels";
import { MonthlyCost } from "@/components/listing/MonthlyCost";
import { offmarketHoursLeft } from "@/lib/offmarket";

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
      "id, title, address, city, postal_code, price_chf, status, property_type, rooms, living_area, description, tour_url, offmarket_until, listing_photos(url, sort_order)"
    )
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle();

  if (!data) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.rpc("log_listing_view", { p_listing_id: id });

  const photos = ((data.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const { data: clipFiles } = await supabase.storage
    .from(CLIP_BUCKET)
    .list(clipFolder(id), { sortBy: { column: "name", order: "asc" } });
  const clips = (clipFiles ?? [])
    .filter((f) => isClipFile(f.name))
    .map((f) => supabase.storage.from(CLIP_BUCKET).getPublicUrl(`${clipFolder(id)}/${f.name}`).data.publicUrl);

  const { data: flightFiles } = await supabase.storage
    .from(CLIP_BUCKET)
    .list(flightFolder(id), { sortBy: { column: "name", order: "asc" } });
  const flight = (flightFiles ?? [])
    .filter((f) => isClipFile(f.name))
    .map((f) => ({
      url: supabase.storage.from(CLIP_BUCKET).getPublicUrl(`${flightFolder(id)}/${f.name}`).data.publicUrl,
      label: flightLabel(f.name),
    }));

  return { ...data, photos, clips, flight, loggedIn: Boolean(user) } as typeof data & {
    photos: typeof photos;
    clips: string[];
    flight: { url: string; label: string }[];
    loggedIn: boolean;
  };
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
  const offmarketHours = listing.status === "active" ? offmarketHoursLeft(listing.offmarket_until as string | null) : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";

  if (offmarketHours && !listing.loggedIn) {
    return <OffMarketTeaser listing={listing} cover={main?.url ?? null} hours={offmarketHours} />;
  }

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
              {offmarketHours && (
                <span className="absolute right-5 top-5 rounded-full bg-night px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-ink">
                  Off-Market · exklusiv noch {offmarketHours}h
                </span>
              )}
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

        {/* 3D-Rundgang */}
        {listing.tour_url && <ListingTour listingId={listing.id} tourUrl={listing.tour_url} />}
      </main>

      {/* Drohnenflug, falls Übergangs-Clips da sind; sonst der Foto-Rundgang */}
      {listing.flight.length > 0 ? (
        <DroneFlight
          clips={listing.flight}
          title={listing.title || listing.city}
          priceText={listing.price_chf ? formatChf(listing.price_chf) : null}
        />
      ) : (
        <ListingFlythrough
          listing={{
            title: listing.title,
            address: listing.address,
            city: listing.city,
            price_chf: listing.price_chf,
            photos: listing.photos,
            clips: listing.clips,
          }}
        />
      )}

      <main className="mx-auto max-w-6xl px-6 pb-28 pt-16 lg:px-10">
        {/* Kopf */}
        <div id="anfragen" className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
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

            {listing.price_chf && listing.status !== "sold" && <MonthlyCost price={listing.price_chf} />}
          </div>

          {/* CTA-Karte */}
          <div className="h-fit rounded-2xl border border-line bg-ink-2 p-7">
            <div className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
              Verkaufspreis
            </div>
            <div className="mt-2 font-display text-3xl font-semibold text-amber-soft">
              {listing.price_chf ? formatChf(listing.price_chf) : "Auf Anfrage"}
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
              Besichtigung anfragen
            </p>
            <ListingViewingRequest listingId={listing.id} address={listing.title || listing.address} />
            <ContactChannels title={listing.title || `${listing.address}, ${listing.city}`} url={`${siteUrl}/immobilien/${listing.id}`} />
            <Link
              href={`/immobilien/${listing.id}/expose`}
              target="_blank"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4 hover:text-amber-soft"
            >
              Exposé als PDF →
            </Link>
            <p className="mt-4 text-xs text-ivory-dim/60">
              Persönliche Auskunft durch unser Team, NoviDom Immo.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function OffMarketTeaser({
  listing,
  cover,
  hours,
}: {
  listing: { id: string; title: string | null; city: string; rooms: number | null; living_area: number | null; property_type: string | null };
  cover: string | null;
  hours: number;
}) {
  const facts = [listing.property_type, listing.rooms ? `${listing.rooms} Zimmer` : null, listing.living_area ? `${listing.living_area} m²` : null]
    .filter(Boolean)
    .join(" · ");
  const redirect = encodeURIComponent(`/immobilien/${listing.id}`);
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-6 pb-28 pt-32 lg:px-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-ink-2">
          {cover && <Image src={cover} alt="" fill sizes="(min-width: 1024px) 900px, 100vw" className="scale-110 object-cover blur-xl" />}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-night/40 p-6 text-center text-ink">
            <span className="rounded-full bg-amber px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-white">
              Off-Market · noch {hours}h exklusiv
            </span>
            <h1 className="mt-5 font-display text-3xl lg:text-5xl">Neues Objekt in {listing.city}</h1>
            {facts && <p className="mt-2 text-ink/85">{facts}</p>}
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-line bg-white p-7 text-center">
          <h2 className="font-display text-2xl text-ivory">Vorgemerkte Käufer sehen es zuerst.</h2>
          <p className="mx-auto mt-2 max-w-xl text-ivory-dim">
            Neue Objekte zeigen wir 48 Stunden lang nur Käuferinnen und Käufern mit Kundenkonto, bevor sie auf die Portale gehen. Kostenlos
            registrieren, Suchprofil anlegen und sofort alles sehen.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/login?redirect=${redirect}`} className="rounded-full bg-night px-6 py-3.5 text-sm font-semibold text-ink hover:bg-amber">
              Kostenlos registrieren
            </Link>
            <Link href={`/login?redirect=${redirect}`} className="rounded-full border border-line px-6 py-3.5 text-sm text-ivory hover:border-ivory">
              Anmelden
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
