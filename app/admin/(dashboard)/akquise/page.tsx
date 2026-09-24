import type { Metadata } from "next";
import { AcquisitionTool } from "@/components/admin/AcquisitionTool";

export const metadata: Metadata = {
  title: "Akquise-E-Mail — Admin",
  robots: { index: false, follow: false },
};

export default function AdminAkquisePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ivory">Akquise-E-Mail</h1>
      <p className="mt-2 text-sm text-ivory-dim">
        Objektdaten eintragen, Text wird automatisch erstellt — direkt kopieren oder im E-Mail-Programm
        öffnen.
      </p>
      <div className="mt-4">
        <AcquisitionTool />
      </div>
    </div>
  );
}
