import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloorPlanner } from "@/components/portal/FloorPlanner";
import { Logo } from "@/components/ui/Logo";
import { SAMPLE_PLAN, sanitizeItems } from "@/lib/floorplan";

export const metadata: Metadata = {
  title: "Grundriss-Planer",
  robots: { index: false, follow: false },
};

export default async function PlanerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== "demo" && !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  if (!supabase) notFound();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/dashboard/planer/${id}`);

  let listing = { id, title: "Beispielwohnung 5.5 Zimmer", price: null as number | null, isDemo: true };
  if (id !== "demo") {
    const { data } = await supabase
      .from("listings")
      .select("id, title, address, city, price_chf")
      .eq("id", id)
      .in("status", ["active", "reserved"])
      .maybeSingle();
    if (!data) notFound();
    listing = { id, title: data.title || `${data.address}, ${data.city}`, price: data.price_chf ?? null, isDemo: false };
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
          {" "}Der Grundriss ist ein Beispielplan, bis der echte Giraffe360-Plan des Objekts hinterlegt ist.
        </p>
        <div className="mt-6">
          <FloorPlanner plan={SAMPLE_PLAN} listing={listing} initialItems={sanitizeItems(saved)} />
        </div>
      </div>
    </main>
  );
}
