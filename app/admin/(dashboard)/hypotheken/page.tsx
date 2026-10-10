import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCrmCustomers } from "@/lib/admin-data";
import { HypoWatchList } from "@/components/admin/HypoWatchList";

export const metadata: Metadata = {
  title: "Hypothekenwächter — Admin",
  robots: { index: false, follow: false },
};

export default async function HypothekenPage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const customers = await getCrmCustomers(supabase);

  const hypos = customers
    .filter((c) => c.hypo_ablauf && c.typ !== "ex")
    .sort((a, b) => (a.hypo_ablauf ?? "").localeCompare(b.hypo_ablauf ?? ""))
    .map((c) => ({
      id: c.id,
      name: c.full_name,
      email: c.email,
      phone: c.phone,
      ablauf: c.hypo_ablauf as string,
      betrag: c.hypo_betrag,
      zins: c.hypo_zins,
      bank: c.hypo_bank,
      erinnert: c.hypo_erinnert_at,
    }));
  const owners = customers
    .filter((c) => c.wertmonitor && c.typ !== "ex")
    .map((c) => ({
      id: c.id,
      name: c.full_name,
      email: c.email,
      phone: c.phone,
      objekt: `${c.wertmonitor!.typ}, ${c.wertmonitor!.flaeche} m², ${c.wertmonitor!.region}`,
      wert: c.wertmonitor!.wert?.mid ?? null,
      lastSent: c.wertmonitor!.last_sent_at ?? null,
    }));

  return <HypoWatchList hypos={hypos} owners={owners} />;
}
