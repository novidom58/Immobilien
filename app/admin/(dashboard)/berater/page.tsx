import type { Metadata } from "next";
import { requirePartnerPage } from "@/lib/roles";
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
  await requirePartnerPage(supabase);

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
            <div className="card-title">Zugang zum CRM einladen</div>
            <div className="card-sub">
              Partner sehen alles. Mitarbeitende sehen nur ihre zugeteilten Leads, Kunden, Objekte und Termine, keine Firmenzahlen und
              keine Einstellungen.
            </div>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <AdminInviteForm beraterOptions={berater.map((b) => b.name)} />
        </div>
      </div>
    </div>
  );
}
