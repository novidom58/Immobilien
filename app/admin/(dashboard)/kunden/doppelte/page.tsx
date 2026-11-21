import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/roles";
import { getCrmCustomers } from "@/lib/admin-data";
import { findDuplicates } from "@/lib/duplicates";
import { MergeGroup } from "@/components/admin/MergeCustomers";

export const metadata: Metadata = {
  title: "Doppelte Kunden — Admin",
  robots: { index: false, follow: false },
};

/** Mögliche doppelte Kunden prüfen und zusammenführen (nur Partner). */
export default async function DoppeltePage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const staff = await getStaff(supabase);
  if (staff?.role !== "admin") return <div className="card" style={{ padding: 20 }}>Nur Partner können Kunden zusammenführen.</div>;

  const customers = await getCrmCustomers(supabase);
  const groups = findDuplicates(customers);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Doppelte Kunden</div>
          <div className="page-sub">
            Gleiche E-Mail, gleiche Telefonnummer oder gleicher Name. Wählen, welcher Eintrag bleibt: Er übernimmt fehlende Angaben, Rollen, Notizen, Verlauf,
            Termine und Käufer-Alarme des anderen.
          </div>
        </div>
        <Link href="/admin/kunden" className="btn btn-ghost btn-sm">
          ← Alle Kunden
        </Link>
      </div>
      {groups.length === 0 ? (
        <div className="card" style={{ padding: 20 }}>Keine doppelten Kunden gefunden.</div>
      ) : (
        groups.map((g) => <MergeGroup key={g.kunden.map((k) => k.id).join("|")} grund={g.grund} kunden={g.kunden} />)
      )}
    </div>
  );
}
