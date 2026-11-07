import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloorPlanner } from "@/components/portal/FloorPlanner";
import { planFor, sanitizeItems, type PlacedItem } from "@/lib/floorplan";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Grundriss-Planer — NoviDom",
  description: "Möbel massstabsgetreu im Grundriss platzieren und Umbau-Ideen ausprobieren. Ohne Anmeldung, am Handy und am Computer.",
  alternates: { canonical: "/grundriss-planer" },
};

/**
 * Öffentlicher Grundriss-Planer mit der Beispielwohnung: sofort nutzbar,
 * ohne Login. Wer angemeldet ist, kann die Einrichtung speichern.
 */
export default async function GrundrissPlanerPage() {
  let initialItems: PlacedItem[] = [];
  let loggedIn = false;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      loggedIn = true;
      const { data } = await supabase.from("customer_plans").select("layouts").eq("user_id", user.id).maybeSingle();
      initialItems = sanitizeItems((data?.layouts as Record<string, { items?: unknown }> | null)?.demo?.items);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl bg-ink px-4 pb-24 pt-32 sm:px-6 lg:px-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Grundriss-Planer · Beispielwohnung 5.5 Zimmer</div>
        <h1 className="mt-4 text-balance font-display text-4xl text-ivory lg:text-6xl">
          Ideen am Grundriss <em>ausprobieren.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ivory-dim">
          Möbel oben antippen und an ihren Platz ziehen. Alle Masse stimmen. Für Ihr eigenes Objekt laden wir den echten Grundriss im Kundenportal.
        </p>
        <div className="mt-10">
          <FloorPlanner
            plan={planFor("demo")}
            listing={{ id: "demo", title: "Beispielwohnung 5.5 Zimmer", price: null, isDemo: true }}
            initialItems={initialItems}
            guestLoginHref={loggedIn ? undefined : "/login?redirect=/dashboard/planer/demo"}
          />
        </div>
        <p className="mt-6 text-sm text-ivory-dim">
          Lieber einen echten Grundriss?{" "}
          <Link href="/rundgang" className="text-amber underline underline-offset-4">
            Rundgang durch eine 3.5-Zimmer-Wohnung
          </Link>{" "}
          oder{" "}
          <Link href="/leistungen/umbauen#kontakt" className="text-amber underline underline-offset-4">
            Umbau mit uns besprechen
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
