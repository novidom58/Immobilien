import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/lib/reveal";
import { ServiceMapClient } from "@/components/map/ServiceMapClient";
import { createClient } from "@/lib/supabase/server";
import type { MapListing } from "@/components/map/MapCanvas";

export async function ServiceMap() {
  let listings: MapListing[] = [];

  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("listings")
      .select("id, title, address, city, lat, lng")
      .in("status", ["active", "reserved", "sold"])
      .not("lat", "is", null)
      .not("lng", "is", null);
    listings = (data as MapListing[] | null) ?? [];
  }

  return (
    <section className="relative bg-ink py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionLabel>Einzugsgebiet</SectionLabel>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center lg:gap-16">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-ivory lg:text-5xl">
              Zuhause in der
              <br />
              <span className="text-amber-soft">gesamten Region Basel.</span>
            </h2>
            <p className="mt-6 max-w-md text-balance text-lg text-ivory-dim">
              Von der Stadt bis ins Baselbiet — wir kennen die lokalen
              Märkte, Preise und Käuferkreise in jeder dieser Gemeinden
              persönlich.
            </p>
            {listings.length > 0 && (
              <p className="mt-4 max-w-md text-sm text-ivory-dim/70">
                {listings.length} aktive{listings.length === 1 ? "s Inserat" : " Inserate"} auf der Karte.
              </p>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <ServiceMapClient listings={listings} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
