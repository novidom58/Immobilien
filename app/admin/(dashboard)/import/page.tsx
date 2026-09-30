import type { Metadata } from "next";
import { CsvImportTool } from "@/components/admin/CsvImportTool";

export const metadata: Metadata = {
  title: "Excel-Import — Admin",
  robots: { index: false, follow: false },
};

export default function AdminImportPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Excel-Import</div>
          <div className="page-sub">Bestandskontakte aus Excel/CSV als Leads importieren</div>
        </div>
      </div>
      <CsvImportTool />
    </div>
  );
}
