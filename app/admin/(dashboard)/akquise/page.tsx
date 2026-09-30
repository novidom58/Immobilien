import type { Metadata } from "next";
import { AcquisitionTool } from "@/components/admin/AcquisitionTool";

export const metadata: Metadata = {
  title: "Akquise-E-Mail — Admin",
  robots: { index: false, follow: false },
};

export default function AdminAkquisePage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Akquise-E-Mail</div>
          <div className="page-sub">Objektdaten eintragen, Text wird automatisch erstellt — direkt kopieren oder im E-Mail-Programm öffnen</div>
        </div>
      </div>
      <AcquisitionTool />
    </div>
  );
}
