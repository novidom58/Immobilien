import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  Haus: "Einfamilienhaus",
  Wohnung: "Wohnung",
  Stockwerkeigentum: "Stockwerkeigentum",
  Rendite: "Renditeliegenschaft",
  Andere: "Andere",
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
      "id, title, address, city, postal_code, price_chf, property_type, rooms, living_area, description, listing_photos(url, sort_order)"
    )
    .eq("id", id)
    .in("status", ["active", "reserved", "sold"])
    .maybeSingle();

  if (!data) return null;

  await supabase.rpc("log_listing_expose_download", { p_listing_id: id });

  const photos = ((data.listing_photos as { url: string; sort_order: number }[] | null) ?? []).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return { ...data, photos };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  return {
    title: listing ? `Exposé — ${listing.title || listing.address}` : "Exposé",
    robots: { index: false, follow: false },
  };
}

export default async function ListingExposePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const facts: [string, string][] = [
    ["Objekttyp", TYPE_LABEL[listing.property_type] || listing.property_type],
  ];
  if (listing.rooms) facts.push(["Zimmer", String(listing.rooms)]);
  if (listing.living_area) facts.push(["Wohnfläche", `${listing.living_area} m²`]);
  facts.push(["Lage", `${listing.postal_code ? listing.postal_code + " " : ""}${listing.city}`]);

  const mainPhoto = listing.photos[0];

  return (
    <main className="min-h-svh bg-[#eceae4] px-4 py-10 font-sans text-[#1c1a16] print:bg-white print:p-0">
      {/* Hinweisleiste - erscheint nicht im Druck */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between rounded-xl bg-[#1c1a16] px-5 py-3 text-sm text-white print:hidden">
        <span>
          <strong>Exposé</strong> — {listing.title || `${listing.address}, ${listing.city}`}
        </span>
        <span className="text-white/60">Mit Ctrl+P als PDF speichern</span>
      </div>

      {/* Das "Papier" */}
      <div className="mx-auto max-w-3xl bg-white shadow-xl print:shadow-none">
        {/* Kopf */}
        <div className="flex items-center justify-between px-10 pt-8">
          <span className="text-xl font-bold tracking-tight">
            Novi<span className="text-[#c07f2a]">Dom</span> Immo
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8a8578]">
            Verkaufsdokumentation
          </span>
        </div>

        {/* Objektbild */}
        <div className="relative mx-10 mt-6 aspect-[16/9] overflow-hidden rounded-lg bg-[#eceae4]">
          {mainPhoto ? (
            <Image src={mainPhoto.url} alt="" fill sizes="768px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Home className="h-14 w-14 text-[#c4bfb0]" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Titel + Preis */}
        <div className="px-10 pt-8">
          <h1 className="text-3xl font-bold leading-tight">
            {listing.title || `${listing.address}, ${listing.city}`}
          </h1>
          <p className="mt-1 text-[#6b675c]">
            {listing.address} · {listing.postal_code ? `${listing.postal_code} ` : ""}
            {listing.city}
          </p>
          <div className="mt-5 inline-block rounded-lg bg-[#f4efe6] px-5 py-3">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#a08752]">
              Verkaufspreis
            </span>
            <span className="text-2xl font-bold text-[#7c5a1e]">
              {listing.price_chf ? formatChf(listing.price_chf) : "Auf Anfrage"}
            </span>
          </div>
        </div>

        {/* Eckdaten + Beschreibung */}
        <div className="grid gap-10 px-10 pt-8 sm:grid-cols-2">
          <div>
            <h2 className="border-b border-[#e3ded2] pb-2 text-sm font-bold uppercase tracking-wide">
              Eckdaten
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-[#6b675c]">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="border-b border-[#e3ded2] pb-2 text-sm font-bold uppercase tracking-wide">
              Beschreibung
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#4b473e]">
              {listing.description || "Weitere Angaben auf Anfrage."}
            </p>
          </div>
        </div>

        {/* Fusszeile */}
        <div className="mt-10 flex items-center justify-between border-t border-[#e3ded2] px-10 py-6 text-sm">
          <div>
            <div className="font-bold">NoviDom Immo</div>
            <div className="text-[#6b675c]">Basel &amp; Zug · beratung@novidom-immo.ch</div>
          </div>
          <div className="text-right text-[#6b675c]">
            <div>3D-Rundgang &amp; weitere Bilder:</div>
            <div className="font-medium text-[#1c1a16]">
              www.novidom-immo.ch/immobilien/{listing.id}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl text-center print:hidden">
        <Link
          href={`/immobilien/${listing.id}`}
          className="text-sm text-[#6b675c] underline underline-offset-4 hover:text-[#1c1a16]"
        >
          ← Zurück zum Objekt
        </Link>
      </div>
    </main>
  );
}
