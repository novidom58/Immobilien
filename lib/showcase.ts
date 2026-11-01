import { createClient } from "@/lib/supabase/server";
import type { ShowcaseItem } from "@/components/hero/HeroShowcase";
import { publicListingFilter } from "@/lib/offmarket";
import { offerTypeOf, priceText } from "@/lib/listingOffer";

/** Aktive und reservierte Inserate mit Titelbild für die Hero-Bildkarte. */
export async function getShowcase(): Promise<ShowcaseItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("listings")
    // "*" statt fester Spalten, damit fehlende neue Spalten nichts brechen
    .select("*, listing_photos(url, sort_order)")
    .in("status", ["active", "reserved"])
    .or(publicListingFilter())
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []).flatMap((l) => {
    const photos = ((l.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    );
    if (photos.length === 0) return [];
    const offer = offerTypeOf(l.offer_type as string | null);
    const facts = [
      l.rooms ? `${l.rooms} Zimmer` : null,
      l.living_area ? `${l.living_area} m²` : null,
      l.status === "reserved" ? "Reserviert" : l.price_chf ? priceText(l.price_chf as number, offer) : null,
    ].filter(Boolean);
    return [
      {
        id: l.id as string,
        image: photos[0].url,
        place: l.city as string,
        title: (l.title as string | null) || null,
        offer,
        facts: facts.join(" · "),
      },
    ];
  });
}
