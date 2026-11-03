import type { createClient } from "@/lib/supabase/server";
import { karriereStand, type Anstellung, type Posten } from "@/lib/karriere";

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type Row = Record<string, unknown>;

/** Lädt Abschlüsse (Immobilien, bestätigte Versicherungen/Hypotheken) einer Person und rechnet den Karrierestand. */
export async function loadKarriere(supabase: Supabase, name: string, anstellung: Anstellung) {
  const { data: listingRows } = await supabase.from("listings").select("id, title, address, city").eq("berater", name);
  const listings = (listingRows ?? []) as Row[];
  const ids = listings.map((l) => l.id as string);
  const [dealsRes, ertraegeRes] = await Promise.all([
    ids.length ? supabase.from("listing_deals").select("*").in("listing_id", ids) : Promise.resolve({ data: [] as Row[], error: null }),
    supabase.from("staff_ertraege").select("*").eq("berater", name).order("abgeschlossen_am", { ascending: false }),
  ]);
  const ertraege = (ertraegeRes.data ?? []) as Row[];

  const posten: Posten[] = [];
  for (const d of (dealsRes.data ?? []) as Row[]) {
    const price = Number(d.sold_price) || 0;
    const pct = Number(d.commission_pct) || 0;
    if (!d.sold_at || !price || !pct) continue;
    const l = listings.find((x) => x.id === d.listing_id);
    posten.push({
      id: d.listing_id as string,
      art: "immobilie",
      titel: (l?.title as string) || `${l?.address ?? ""}, ${l?.city ?? ""}`,
      datum: d.sold_at as string,
      umsatz: (price * pct) / 100,
      volumen: price,
    });
  }
  for (const e of ertraege) {
    if (!e.bestaetigt_am || !Number(e.ertrag_chf)) continue;
    posten.push({
      id: e.id as string,
      art: e.art === "hypothek" ? "hypothek" : "versicherung",
      titel: (e.kunde as string) || (e.art === "hypothek" ? "Hypothek" : "Versicherung"),
      datum: e.abgeschlossen_am as string,
      umsatz: Number(e.ertrag_chf),
      volumen: Number(e.volumen_chf) || null,
    });
  }

  return {
    stand: karriereStand(posten, anstellung),
    offen: ertraege.filter((e) => !e.bestaetigt_am),
    needsSql: Boolean(ertraegeRes.error),
  };
}
