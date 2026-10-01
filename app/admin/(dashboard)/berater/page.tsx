import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BeraterManager } from "@/components/admin/BeraterManager";
import { AdminInviteForm } from "@/components/admin/AdminInviteForm";
import { getBeraterNames } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Berater — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBeraterPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const berater = await getBeraterNames(supabase);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Berater</div>
          <div className="page-sub">Wer in den Auswahlfeldern zur Verfügung steht — gilt für alle, liegt in Supabase</div>
        </div>
      </div>
      <BeraterManager berater={berater} />

      <div className="card" style={{ maxWidth: 560, marginTop: 20 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Admin-Zugang einladen</div>
            <div className="card-sub">Voller Zugriff auf diesen Admin-Bereich (nicht nur die Auswahlliste oben)</div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <AdminInviteForm />
        </div>
      </div>
    </div>
  );
}
