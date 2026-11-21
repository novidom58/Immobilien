import { createClient } from "@/lib/supabase/server";
import type { SocialListing, SocialVorlage } from "@/lib/socialPost";
import { socialImage } from "@/lib/socialImage";
import { offerTypeOf } from "@/lib/listingOffer";

// Instagram-Bild aus einem Inserat: echtes Objektfoto, dazu Eckdaten und Logo
// in ruhiger Gestaltung. Nur öffentliche Objekte (aktiv, reserviert, verkauft).
// ?vorlage=neu|fakten|status|story&foto=0 (Index des Fotos)

const VORLAGEN = new Set<SocialVorlage>(["neu", "fakten", "status", "story"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const vorlageParam = url.searchParams.get("vorlage") as SocialVorlage | null;
  const vorlage: SocialVorlage = vorlageParam && VORLAGEN.has(vorlageParam) ? vorlageParam : "neu";
  const fotoIndex = Math.max(0, Number(url.searchParams.get("foto")) || 0);

  const supabase = await createClient();
  if (!supabase) return new Response("Nicht eingerichtet", { status: 503 });
  const { data } = await supabase
    .from("listings")
    .select("*, listing_photos(url, sort_order)")
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle();
  if (!data) return new Response("Objekt nicht gefunden", { status: 404 });

  const photos = ((data.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const foto = photos[Math.min(fotoIndex, Math.max(0, photos.length - 1))]?.url ?? null;
  const l: SocialListing = {
    id,
    title: data.title,
    city: data.city,
    property_type: data.property_type ?? "Objekt",
    offer_type: offerTypeOf(data.offer_type),
    status: data.status,
    price_chf: data.price_chf,
    rooms: data.rooms,
    living_area: data.living_area,
  };

  return socialImage(l, vorlage, foto, Boolean(url.searchParams.get("download")));
}
