import type { Metadata } from "next";
import { CsvImportTool } from "@/components/admin/CsvImportTool";
import { createClient } from "@/lib/supabase/server";
import { requirePartnerPage } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Excel-Import — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminImportPage() {
  const supabase = await createClient();
  if (!supabase) return null;
  await requirePartnerPage(supabase);
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Excel-Import</div>
          <div className="page-sub">Bestandskontakte aus Excel/CSV direkt als Kunden importieren</div>
        </div>
      </div>
      <CsvImportTool />
    </div>
  );
}
