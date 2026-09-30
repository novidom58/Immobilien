import type { Metadata } from "next";
import { KalenderEmbed } from "@/components/admin/KalenderEmbed";

export const metadata: Metadata = {
  title: "Kalender — Admin",
  robots: { index: false, follow: false },
};

export default function AdminKalenderPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Kalender</div>
          <div className="page-sub">Alle Termine an einem Ort — auch die, die Cal.com in den Google-Kalender schreibt</div>
        </div>
      </div>
      <KalenderEmbed />
    </div>
  );
}
