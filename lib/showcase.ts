import { createClient } from "@/lib/supabase/server";
import type { ShowcaseItem } from "@/components/hero/HeroShowcase";

function formatChf(value: number) {
  return `CHF ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

/** Aktive und reservierte Inserate mit Titelbild für die Hero-Bildkarte. */
export async function getShowcase(): Promise<ShowcaseItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("listings")
    .select("id, city, rooms, living_area, price_chf, status, listing_photos(url, sort_order)")
    .in("status", ["active", "reserved"])
    .order("created_at", { ascending: false })
    .limit(6);

  return (data ?? []).flatMap((l) => {
    const photos = ((l.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort(
      (a, b) => a.sort_order - b.sort_order
    );
    if (photos.length === 0) return [];
    const facts = [
      l.rooms ? `${l.rooms} Zimmer` : null,
      l.living_area ? `${l.living_area} m²` : null,
      l.status === "reserved" ? "Reserviert" : l.price_chf ? formatChf(l.price_chf as number) : null,
    ].filter(Boolean);
    return [{ id: l.id as string, image: photos[0].url, place: l.city as string, facts: facts.join(" · ") }];
  });
}
