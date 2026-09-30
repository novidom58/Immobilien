import type { Metadata } from "next";
import { CustomerInviteForm } from "@/components/admin/CustomerInviteForm";

export const metadata: Metadata = {
  title: "Kunde erfassen — Admin",
  robots: { index: false, follow: false },
};

export default function AdminKundeErfassenPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Kunde erfassen</div>
          <div className="page-sub">Legt einen Login an und schickt eine Einladungsmail zum Passwort-Setzen</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        <div style={{ padding: 20 }}>
          <CustomerInviteForm />
        </div>
      </div>
    </div>
  );
}
