import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getNewsletterSubscribers } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Newsletter — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const subscribers = await getNewsletterSubscribers(supabase);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Newsletter-Abonnenten</div>
          <div className="page-sub">{subscribers.length} Anmeldungen</div>
        </div>
      </div>

      <div className="card">
        {subscribers.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">Noch keine Anmeldungen</div>
          </div>
        ) : (
          <div>
            {subscribers.map((s) => (
              <div key={s.email} className="flex items-center justify-between" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
                <span className="td-name">{s.email}</span>
                <span className="td-light" style={{ fontSize: 12 }}>
                  {s.source ?? "—"} · {new Date(s.created_at).toLocaleDateString("de-CH")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
