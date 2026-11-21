import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getListingsForAdmin } from "@/lib/admin-data";
import { SocialPostCard } from "@/components/admin/SocialPostCard";
import type { SocialListing } from "@/lib/socialPost";

export const metadata: Metadata = {
  title: "Social Media — Admin",
  robots: { index: false, follow: false },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://novidom-immo.ch";

/** Für jedes Inserat fertige Instagram-/Facebook-Beiträge: Bild + Text. */
export default async function SocialPage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const listings = (await getListingsForAdmin(supabase)).filter((l) => ["active", "reserved", "sold"].includes(l.status));
  const order: Record<string, number> = { active: 0, reserved: 1, sold: 2 };
  listings.sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Social Media</div>
          <div className="page-sub">
            Für jedes Objekt ein fertiger Beitrag: Vorlage wählen, Bild herunterladen, Text kopieren und in Instagram oder Facebook einfügen. Bild und
            Text passen sich automatisch an, wenn Sie das Inserat ändern (z.B. Status «Reserviert»).
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 14, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
        <strong>So geht&apos;s am schnellsten:</strong> Neues Objekt: «Neu im Angebot» als 1. Bild, «Eckdaten» als 2. Bild, dazu 3 bis 5 weitere Fotos
        aus dem Inserat. Reserviert oder verkauft: «Reserviert / Verkauft» posten. Für die Story die Vorlage «Story 9:16». Am besten zwischen 18 und 20
        Uhr posten.
      </div>
      {listings.length === 0 ? (
        <div className="card" style={{ padding: 20 }}>Noch keine veröffentlichten Inserate.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {listings.map((l) => {
            const listing: SocialListing = {
              id: l.id,
              title: l.title,
              city: l.city,
              property_type: l.property_type,
              offer_type: l.offer_type as SocialListing["offer_type"],
              status: l.status,
              price_chf: l.price_chf,
              rooms: l.rooms,
              living_area: l.living_area,
              details: (l.details as SocialListing["details"]) ?? null,
            };
            return <SocialPostCard key={l.id} listing={listing} photoCount={l.photoCount} siteUrl={SITE_URL} />;
          })}
        </div>
      )}
    </div>
  );
}
