import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BeraterManager } from "@/components/admin/BeraterManager";
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
    </div>
  );
}
