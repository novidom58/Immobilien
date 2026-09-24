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
      <h1 className="font-display text-2xl font-semibold text-ivory">Lead erfassen</h1>
      <p className="mt-2 text-sm text-ivory-dim">
        Für Anfragen, die telefonisch oder persönlich reinkommen, nicht über die Webseite.
      </p>
      <div className="mt-4 max-w-2xl rounded-2xl border border-line bg-ink-2 p-5">
        <LeadCreateForm listings={listings.map((l) => ({ id: l.id, label: `${l.address}, ${l.city}` }))} />
      </div>
    </div>
  );
}
