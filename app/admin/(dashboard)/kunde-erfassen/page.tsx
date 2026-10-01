import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CustomerCreateForm } from "@/components/admin/CustomerCreateForm";
import { getBeraterNames } from "@/lib/admin-data";
import { BERATER_OPTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kunde erfassen — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminKundeErfassenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const beraterRows = await getBeraterNames(supabase);
  const beraterOptions = beraterRows.length > 0 ? beraterRows.map((b) => b.name) : [...BERATER_OPTIONS];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Kunde erfassen</div>
          <div className="page-sub">Für Kontakte, die telefonisch, persönlich oder über die Akquise reinkommen</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 640 }}>
        <div style={{ padding: 20 }}>
          <CustomerCreateForm beraterOptions={beraterOptions} />
        </div>
      </div>
    </div>
  );
}
