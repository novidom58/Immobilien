"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, Calculator } from "lucide-react";
import { toggleFavorite } from "@/app/dashboard/actions";

export type PortalListing = {
  id: string;
  title: string;
  city: string;
  price_chf: number | null;
  rooms: number | null;
  living_area: number | null;
  cover: string | null;
  tour_url: string | null;
  favorite: boolean;
  match: boolean;
};

function chf(value: number) {
  return `CHF ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'")}`;
}

export function MatchList({ listings, onCheckPrice }: { listings: PortalListing[]; onCheckPrice?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function handleFavorite(id: string) {
    setBusy(id);
    await toggleFavorite(id);
    setBusy(null);
    router.refresh();
  }

  if (listings.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-ink-2 p-6 text-sm text-ivory-dim">
        Im Moment passt noch kein Objekt zu Ihrem Suchprofil. Mit aktivem Käufer-Alarm melden wir uns, sobald eines kommt.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {listings.map((l) => (
        <article key={l.id} className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="relative aspect-[16/10] bg-ink-3">
            {l.cover && <Image src={l.cover} alt="" fill sizes="(min-width: 640px) 400px, 100vw" unoptimized className="object-cover" />}
            {l.match && (
              <span className="absolute left-3 top-3 rounded-full bg-night/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
                Passt zu Ihrem Profil
              </span>
            )}
            <button
              type="button"
              onClick={() => handleFavorite(l.id)}
              disabled={busy === l.id}
              aria-pressed={l.favorite}
              aria-label={l.favorite ? "Aus Favoriten entfernen" : "Als Favorit merken"}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow"
            >
              <Heart className={`h-5 w-5 ${l.favorite ? "fill-amber text-amber" : "text-night"}`} strokeWidth={1.75} />
            </button>
          </div>
          <div className="p-5">
            <div className="font-display text-xl text-ivory">{l.title}</div>
            <div className="mt-1 text-sm text-ivory-dim">
              {[l.city, l.rooms ? `${l.rooms} Zi.` : null, l.living_area ? `${l.living_area} m²` : null].filter(Boolean).join(" · ")}
            </div>
            {l.price_chf && <div className="mt-2 font-display text-lg text-amber">{chf(l.price_chf)}</div>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/immobilien/${l.id}`} className="rounded-full bg-night px-4 py-2 text-xs font-semibold text-ink hover:bg-amber">
                Ansehen
              </Link>
              {l.price_chf && onCheckPrice && (
                <Link
                  href={`?preis=${l.price_chf}#finanzierung`}
                  scroll={false}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs text-ivory hover:border-ivory"
                >
                  <Calculator className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Finanzierung prüfen
                </Link>
              )}
              {l.tour_url && (
                <a
                  href={l.tour_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs text-ivory hover:border-ivory"
                >
                  <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Rundgang &amp; Grundriss
                </a>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
