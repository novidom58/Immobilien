"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, Calculator, Sofa, CalendarCheck, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/social";
import { offmarketHoursLeft } from "@/lib/offmarket";

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK_VIEWING || process.env.NEXT_PUBLIC_CAL_LINK;
const HAS_WHATSAPP = Boolean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
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
  offmarket_until?: string | null;
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
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {offmarketHoursLeft(l.offmarket_until) && (
                <span className="rounded-full bg-amber px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white">
                  Off-Market · noch {offmarketHoursLeft(l.offmarket_until)}h exklusiv
                </span>
              )}
              {l.match && (
                <span className="rounded-full bg-night/85 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink">
                  Passt zu Ihrem Profil
                </span>
              )}
            </div>
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
              <Link
                href={`/dashboard/planer/${l.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber px-4 py-2 text-xs font-semibold text-amber hover:bg-amber hover:text-white"
              >
                <Sofa className="h-3.5 w-3.5" strokeWidth={1.5} />
                Selbst einrichten
              </Link>
              <a
                href={CAL_LINK ? `https://cal.com/${CAL_LINK}` : `/immobilien/${l.id}#anfragen`}
                target={CAL_LINK ? "_blank" : undefined}
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs text-ivory hover:border-ivory"
              >
                <CalendarCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Besichtigung buchen
              </a>
              {HAS_WHATSAPP && (
                <a
                  href={whatsappLink(`Hallo NoviDom, ich möchte «${l.title}» in ${l.city} besichtigen.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366] px-4 py-2 text-xs font-semibold text-white"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                  WhatsApp
                </a>
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
