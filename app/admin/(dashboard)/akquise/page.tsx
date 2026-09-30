import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AcquisitionTool } from "@/components/admin/AcquisitionTool";
import { getBeraterNames } from "@/lib/admin-data";
import { BERATER_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Akquise-E-Mail — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminAkquisePage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const beraterRows = await getBeraterNames(supabase);
  const beraterOptions = beraterRows.length > 0 ? beraterRows.map((b) => b.name) : [...BERATER_OPTIONS];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Akquise-E-Mail</div>
          <div className="page-sub">Objektdaten eintragen, Text wird automatisch erstellt — direkt kopieren oder im E-Mail-Programm öffnen</div>
        </div>
      </div>
      <AcquisitionTool beraterOptions={beraterOptions} />
    </div>
  );
}
