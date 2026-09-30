"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminDocumentRow({
  doc,
  listingAddress,
  listingCity,
  listingId,
}: {
  doc: { id: string; name: string; url: string };
  listingAddress: string;
  listingCity: string;
  listingId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!supabase) return;
    if (!window.confirm(`"${doc.name}" wirklich löschen?`)) return;
    setBusy(true);
    if (!doc.url.startsWith("http")) {
      await supabase.storage.from("listing-dokumente").remove([doc.url]);
    }
    await supabase.from("listing_documents").delete().eq("id", doc.id);
    setBusy(false);
    router.refresh();
  }

  return (
    <tr>
      <td className="td-name">
        <FileText className="h-3.5 w-3.5" strokeWidth={1.75} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
        {doc.name}
      </td>
      <td className="td-light">
        {listingAddress}, {listingCity}
      </td>
      <td>
        <a href={`/admin/inserate#${listingId}`} className="btn btn-ghost btn-sm">
          Zum Inserat
        </a>
      </td>
      <td>
        <button type="button" disabled={busy} onClick={handleDelete} className="btn btn-danger btn-sm">
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </td>
    </tr>
  );
}
