import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ApartmentTour, type TourStop } from "@/components/rundgang/ApartmentTour";
import { RUNDGANG_PLAN, sanitizeItems, type PlacedItem } from "@/lib/floorplan";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rundgang: Wohnung 3.5 Zimmer — NoviDom",
  description: "Interaktiver Rundgang durch eine 3.5-Zimmer-Wohnung mit Balkon: Raum für Raum ansehen und selbst einrichten.",
  alternates: { canonical: "/rundgang" },
};

const STOPS: TourStop[] = [
  { room: "Entrée", text: "Hier kommen Sie an. Vom Entrée erreichen Sie den Gang zu den Zimmern, das Gäste-WC und den Wohnbereich." },
  { room: "Wohnen / Essen", text: "Der grösste Raum der Wohnung, mit Fensterfront zum Balkon. Platz für Sofa, Esstisch und Arbeitsecke." },
  { room: "Küche", text: "Offene Küche mit Zeile und Insel, direkt beim Essplatz. Wer kocht, ist mitten im Geschehen." },
  { room: "Balkon", text: "Der Balkon zieht sich über die ganze Breite der Wohnung. Raum für einen Tisch, Lounge und Pflanzen." },
  { room: "Reduit", text: "Abstellraum für Vorräte, Staubsauger und alles, was nicht im Weg stehen soll." },
  { room: "Gang", text: "Der Gang trennt den Wohnbereich von den ruhigen Zimmern." },
  { room: "Zimmer 1", text: "Ruhig gelegen. Passt als Kinderzimmer, Gästezimmer oder Büro." },
  { room: "Zimmer 2", text: "Das grössere Zimmer, ideal als Schlafzimmer mit Platz für einen breiten Kleiderschrank." },
  { room: "Bad", text: "Bad mit Badewanne, nahe bei den Zimmern." },
  { room: "WC", text: "Separates Gäste-WC, damit Besuch nicht durchs Bad muss." },
  { room: "Waschen", text: "Eigener Raum für Waschmaschine und Tumbler in der Wohnung." },
];

export default async function RundgangPage() {
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
      initialItems = sanitizeItems((data?.layouts as Record<string, { items?: unknown }> | null)?.rundgang?.items);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl bg-ink px-4 pb-24 pt-32 sm:px-6 lg:px-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ivory-dim">Rundgang · Beispielwohnung</div>
        <h1 className="mt-4 text-balance font-display text-4xl text-ivory lg:text-6xl">
          3.5 Zimmer mit Balkon. <em>Raum für Raum.</em>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ivory-dim">
          Tippen Sie auf einen Raum oder starten Sie den Rundgang. Danach richten Sie die Wohnung mit Ihren Möbeln ein, massstabsgetreu, am Handy
          oder am Computer.
        </p>
        <div className="mt-10">
          <ApartmentTour plan={RUNDGANG_PLAN} stops={STOPS} rooms="3.5" initialItems={initialItems} guestLoginHref={loggedIn ? undefined : "/login?redirect=/dashboard/planer/rundgang"} />
        </div>
        <p className="mt-6 text-xs text-ivory-dim">
          Grundriss aus dem Verkaufsplan nachgezeichnet, Flächen gerundet. Bei unseren Objekten kommt der exakte Giraffe360-Plan.{" "}
          <Link href="/leistungen/kaufen-verkaufen#giraffe360" className="underline underline-offset-4">
            Mehr zu Giraffe360
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
