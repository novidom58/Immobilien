import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminDocumentRow } from "@/components/admin/AdminDocumentRow";
import { getListingsForAdmin } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Unterlagen — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUnterlagenPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const listings = await getListingsForAdmin(supabase);
  const rows = listings.flatMap((l) =>
    l.documents.map((doc) => ({ doc, address: l.address, city: l.city, listingId: l.id }))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Unterlagen</div>
          <div className="page-sub">Alle Verkaufsdossiers &amp; Dokumente über sämtliche Inserate, {rows.length} Dateien</div>
        </div>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📎</div>
            <div className="empty-text">Noch keine Dokumente</div>
            <div className="empty-sub">Dokumente werden pro Inserat hochgeladen.</div>
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Dokument</th>
                  <th>Inserat</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ doc, address, city, listingId }) => (
                  <AdminDocumentRow key={doc.id} doc={doc} listingAddress={address} listingCity={city} listingId={listingId} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
