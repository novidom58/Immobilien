import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloorPlanner } from "@/components/portal/FloorPlanner";
import { planFor, planFromImage, sanitizeItems, type FloorPlan, type PlacedItem } from "@/lib/floorplan";
import { asDetails, startseiteZuerst } from "@/lib/listingDetails";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Grundriss-Planer — NoviDom",
  description: "Möbel massstabsgetreu im Grundriss platzieren und Umbau-Ideen ausprobieren. Ohne Anmeldung, am Handy und am Computer.",
  alternates: { canonical: "/grundriss-planer" },
};

/**
 * Öffentlicher Grundriss-Planer mit dem echten Grundriss eines unserer
 * Objekte (das Startseiten-Objekt zuerst): sofort nutzbar, ohne Login. Wer
 * angemeldet ist, kann die Einrichtung speichern. Ohne Objekt mit Grundriss
 * fällt er auf den Beispielplan zurück.
 */
export default async function GrundrissPlanerPage() {
  let initialItems: PlacedItem[] = [];
  let loggedIn = false;
  let listing = { id: "demo", title: "Beispielwohnung 5.5 Zimmer", price: null as number | null, isDemo: true };
  let floorPlan: FloorPlan = planFor("demo");
  let kicker = "Beispielplan";
  const supabase = await createClient();
  if (supabase) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id, title, address, city, rooms, price_chf, details, created_at")
      .in("status", ["active", "reserved"])
      .order("created_at", { ascending: false })
      .limit(40);
    const withPlan = startseiteZuerst((listings ?? []).filter((l) => {
      const g = asDetails(l.details).grundriss;
      return Boolean(g?.url && g.breite_m > 0 && g.ratio > 0);
    }));
    const l = withPlan[0];
    if (l) {
      const g = asDetails(l.details).grundriss!;
      floorPlan = planFromImage(g.url, g.breite_m, g.ratio);
      listing = { id: l.id, title: l.title || `${l.address}, ${l.city}`, price: l.price_chf ?? null, isDemo: false };
      kicker = `Echter Grundriss · ${[l.city, l.rooms ? `${l.rooms} Zimmer` : null].filter(Boolean).join(" · ")}`;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      loggedIn = true;
      const { data } = await supabase.from("customer_plans").select("layouts").eq("user_id", user.id).maybeSingle();
      initialItems = sanitizeItems((data?.layouts as Record<string, { items?: unknown }> | null)?.[listing.id]?.items);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl bg-ink px-4 pb-24 pt-32 sm:px-6 lg:px-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Grundriss-Planer · {kicker}</div>
        <h1 className="mt-4 text-balance font-display text-4xl text-ivory lg:text-6xl">
          Ideen am Grundriss <em>ausprobieren.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ivory-dim">
          Möbel oben antippen und an ihren Platz ziehen. Alle Masse stimmen. Im Kundenportal richten Sie jedes unserer Objekte mit Grundriss ein, Ihre Favoriten zuerst.
        </p>
        <div className="mt-10">
          <FloorPlanner
            plan={floorPlan}
            listing={listing}
            initialItems={initialItems}
            guestLoginHref={loggedIn ? undefined : `/login?redirect=/dashboard/planer/${listing.id}`}
          />
        </div>
        <p className="mt-6 text-sm text-ivory-dim">
          Eigene Umbau-Idee?{" "}
          <Link href="/leistungen/umbauen#kontakt" className="text-amber underline underline-offset-4">
            Mit uns besprechen
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
