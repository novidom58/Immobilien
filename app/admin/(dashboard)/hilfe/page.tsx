import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/roles";
import { CRM_WEGWEISER, NEUIGKEITEN } from "@/lib/wegweiser";
import { Wegweiser } from "@/components/admin/Wegweiser";

export const metadata: Metadata = {
  title: "Wo finde ich was? — Admin",
  robots: { index: false, follow: false },
};

/** Wegweiser durchs CRM plus Neuigkeiten: was neu dazugekommen ist. */
export default async function HilfePage() {
  const supabase = await createClient();
  if (!supabase) return null;
  const staff = await getStaff(supabase);
  const isPartner = staff?.role === "admin";
  const gruppen = CRM_WEGWEISER.map((g) => ({ ...g, wege: g.wege.filter((w) => isPartner || !w.nurPartner) })).filter((g) => g.wege.length > 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Wo finde ich was?</div>
          <div className="page-sub">Frage eintippen oder durchschauen. Ein Klick führt direkt hin.</div>
        </div>
      </div>
      <Wegweiser gruppen={gruppen} />

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-title">Neu im CRM</div>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {NEUIGKEITEN.map((n) => (
            <li key={n.text} style={{ borderTop: "1px solid var(--border)", padding: "10px 16px", display: "flex", gap: 12, fontSize: 13 }}>
              <span className="td-light" style={{ whiteSpace: "nowrap" }}>
                {new Date(n.datum).toLocaleDateString("de-CH")}
              </span>
              {n.href ? <Link href={n.href}>{n.text}</Link> : <span>{n.text}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
