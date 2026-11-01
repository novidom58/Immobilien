import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloorPlanner } from "@/components/portal/FloorPlanner";
import { Logo } from "@/components/ui/Logo";
import { planFor, planFromImage, sanitizeItems, type FloorPlan } from "@/lib/floorplan";
import { asDetails } from "@/lib/listingDetails";

export const metadata: Metadata = {
  title: "Grundriss-Planer",
  robots: { index: false, follow: false },
};

export default async function PlanerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "demo" && id !== "rundgang" && !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  if (!supabase) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/dashboard/planer/${id}`);

  let listing = {
    id,
    title: id === "rundgang" ? "Wohnung 3.5 Zimmer mit Balkon" : "Beispielwohnung 5.5 Zimmer",
    price: null as number | null,
    isDemo: true,
  };
  let floorPlan: FloorPlan = planFor(id);
  let realPlan = false;
  if (id !== "demo" && id !== "rundgang") {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .in("status", ["active", "reserved"])
      .maybeSingle();
    if (!data) notFound();
    listing = { id, title: data.title || `${data.address}, ${data.city}`, price: data.price_chf ?? null, isDemo: false };
    const g = asDetails(data.details).grundriss;
    if (g?.url && g.breite_m > 0 && g.ratio > 0) {
      floorPlan = planFromImage(g.url, g.breite_m, g.ratio);
      realPlan = true;
    }
  }

  const { data: plan } = await supabase.from("customer_plans").select("layouts").eq("user_id", user.id).maybeSingle();
  const saved = (plan?.layouts as Record<string, { items?: unknown }> | null)?.[id]?.items;

  return (
    <main className="min-h-svh bg-ink px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="NoviDom Startseite">
            <Logo className="h-8 w-auto" />
          </Link>
          <Link href="/dashboard#objekte" className="text-sm text-ivory-dim underline underline-offset-4">
            ← Mein Immobilienplan
          </Link>
        </div>
        <h1 className="mt-6 font-display text-3xl text-ivory lg:text-4xl">
          {listing.title} <em>einrichten</em>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ivory-dim">
          Alle Masse stimmen. Ziehen Sie Möbel an ihren Platz und sehen Sie, wie Ihr Leben hier aussehen würde.
          {realPlan ? " Massstabsgetreu auf dem echten Grundriss des Objekts." : " Dies ist ein Beispielplan."}
        </p>
        <div className="mt-6">
          <FloorPlanner plan={floorPlan} listing={listing} initialItems={sanitizeItems(saved)} />
        </div>
      </div>
    </main>
  );
}
