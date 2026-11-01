import type { Metadata } from "next";
import { offerTypeOf, priceText, statusBadge } from "@/lib/listingOffer";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Home, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingViewingRequest } from "@/components/ListingViewingRequest";
import { ListingTour } from "@/components/ListingTour";
import { ListingFlythrough } from "@/components/listing/ListingFlythrough";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { asDetails } from "@/lib/listingDetails";
import { createClient } from "@/lib/supabase/server";
import { CLIP_BUCKET, clipFolder, flightFolder, flightLabel, isClipFile } from "@/lib/listingClips";
import { DroneFlight } from "@/components/listing/DroneFlight";
import { ContactChannels } from "@/components/listing/ContactChannels";
import { MonthlyCost } from "@/components/listing/MonthlyCost";
import { offmarketHoursLeft } from "@/lib/offmarket";

export const dynamic = "force-dynamic";


type ListingDetail = {
  id: string;
  title: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  price_chf: number | null;
  status: string;
  offer_type?: string | null;
  property_type: string | null;
  rooms: number | null;
  living_area: number | null;
  description: string | null;
  tour_url: string | null;
  details?: unknown;
  offmarket_until: string | null;
  photos: { url: string; sort_order: number }[];
  clips: string[];
  flight: { url: string; label: string }[];
  loggedIn: boolean;
};

async function getListing(id: string): Promise<ListingDetail | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("listings")
    .select(
      "*, listing_photos(url, sort_order)"
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

  return { ...data, photos, clips, flight, loggedIn: Boolean(user) } as ListingDetail;
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
    description: listing.description || `Immobilie in ${listing.city} — vermittelt von NoviDom Immobilien AG.`,
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

  const offer = offerTypeOf(listing.offer_type);
  const status = statusBadge(listing.status, offer);
  const main = listing.photos[0];
  const offmarketHours = listing.status === "active" ? offmarketHoursLeft(listing.offmarket_until as string | null) : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";

  if (offmarketHours && !listing.loggedIn) {
    return <OffMarketTeaser listing={listing} cover={main?.url ?? null} hours={offmarketHours} />;
  }

  const details = asDetails(listing.details);
  const facts = [
    { label: "Objekttyp", value: listing.property_type },
    { label: "Zimmer", value: listing.rooms ? String(listing.rooms) : null },
    { label: "Wohnfläche", value: listing.living_area ? `${listing.living_area} m²` : null },
    { label: "Badezimmer", value: details.badezimmer },
    { label: "Etage", value: details.etage },
    { label: "Verfügbar ab", value: details.verfuegbar },
    { label: "Baujahr", value: details.baujahr },
    { label: "Letzte Renovation", value: details.renoviert },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));
  const highlights = (details.highlights ?? []).slice(0, 6);
  const merkmale = details.merkmale ?? [];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-32 lg:px-10">
        <Link href="/immobilien" className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory">
          ← Alle Immobilien
        </Link>

        {/* Galerie: Klick öffnet die Bilder gross */}
        <div className="mt-6">
          {listing.photos.length > 0 ? (
            <ListingGallery
              photos={listing.photos}
              badges={
                <>
                  <span className={`absolute left-5 top-5 rounded-full border bg-ink/80 px-3 py-1.5 font-mono text-xs uppercase tracking-wide backdrop-blur-sm ${status.classes}`}>
                    {status.label}
                  </span>
                  {offmarketHours && (
                    <span className="absolute right-5 top-5 rounded-full bg-night px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-ink">
                      Off-Market · exklusiv noch {offmarketHours}h
                    </span>
                  )}
                </>
              }
            />
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-ink-3 via-ink-2 to-ink">
              <Home className="h-16 w-16 text-ivory/10" strokeWidth={1} />
            </div>
          )}
        </div>

        <div id="anfragen" className="mt-12 grid scroll-mt-28 gap-12 lg:grid-cols-[1fr_360px]">
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

            {/* Eckdaten */}
            {facts.length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label} className="bg-white p-4">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ivory-dim/70">{f.label}</dt>
                    <dd className="mt-1 text-ivory">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {highlights.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-ivory">Highlights</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-ivory">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-amber" strokeWidth={2} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {listing.description && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-ivory">Beschreibung</h2>
                <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-ivory-dim">{listing.description}</p>
              </div>
            )}

            {merkmale.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-semibold text-ivory">Ausstattung</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {merkmale.map((m) => (
                    <span key={m} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ivory">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {listing.price_chf && listing.status !== "sold" && offer === "kauf" && <MonthlyCost price={listing.price_chf} />}
          </div>

          {/* CTA-Karte */}
          <div className="h-fit rounded-2xl border border-line bg-ink-2 p-7 lg:sticky lg:top-28">
            <div className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60">
              {offer === "miete" ? "Miete pro Monat" : "Verkaufspreis"}
            </div>
            <div className="mt-2 font-display text-3xl font-semibold text-amber-soft">
              {priceText(listing.price_chf, offer, "Auf Anfrage")}
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-wide text-ivory-dim/60">Besichtigung anfragen</p>
            <ListingViewingRequest listingId={listing.id} address={listing.title || listing.address} />
            <ContactChannels title={listing.title || `${listing.address}, ${listing.city}`} url={`${siteUrl}/immobilien/${listing.id}`} />
            {offer === "kauf" ? (
              <Link
                href={`/immobilien/${listing.id}/expose`}
                target="_blank"
                className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4 hover:text-amber-soft"
              >
                Exposé als PDF →
              </Link>
            ) : (
              <p className="mt-4 text-xs text-ivory-dim">Grundriss und Anmeldeformular erhalten Sie nach der Besichtigung.</p>
            )}
            <p className="mt-4 text-xs text-ivory-dim/60">Persönliche Auskunft durch unser Team, NoviDom Immobilien AG.</p>
          </div>
        </div>

        {/* 3D-Rundgang */}
        {listing.tour_url && <ListingTour listingId={listing.id} tourUrl={listing.tour_url} />}
      </main>

      {/* Video-Elemente nur, wenn wirklich Clips hochgeladen sind */}
      {listing.flight.length > 0 ? (
        <DroneFlight clips={listing.flight} title={listing.title || listing.city} priceText={listing.price_chf ? priceText(listing.price_chf, offer) : null} />
      ) : listing.clips.length > 0 ? (
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
      ) : null}
      <div className="pb-16" />
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
