import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LeadCreateForm } from "@/components/admin/LeadCreateForm";
import { getListingsForAdmin } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Lead erfassen — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminErfassenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const listings = await getListingsForAdmin(supabase);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Lead erfassen</div>
          <div className="page-sub">Für Anfragen, die telefonisch oder persönlich reinkommen, nicht über die Webseite</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ padding: 20 }}>
          <LeadCreateForm listings={listings.map((l) => ({ id: l.id, label: `${l.address}, ${l.city}` }))} />
        </div>
      </div>
    </div>
  );
}
