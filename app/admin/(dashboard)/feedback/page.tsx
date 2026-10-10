import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FeedbackSummary } from "@/components/FeedbackSummary";
import type { ViewingFeedback } from "@/lib/feedback";

export const metadata: Metadata = {
  title: "Besichtigungsfeedback — Admin",
  robots: { index: false, follow: false },
};

export default async function FeedbackAdminPage() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [{ data: feedback }, { data: listings }] = await Promise.all([
    supabase.from("viewing_feedback").select("*").order("created_at", { ascending: false }).limit(300),
    supabase.from("listings").select("id, title, address, city"),
  ]);
  const byListing = new Map<string, ViewingFeedback[]>();
  for (const f of (feedback ?? []) as ViewingFeedback[]) {
    byListing.set(f.listing_id, [...(byListing.get(f.listing_id) ?? []), f]);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Besichtigungsfeedback</div>
          <div className="page-sub">
            Link nach der Besichtigung per WhatsApp oder Instagram senden (Inserate → «Feedback»). Die Eigentümer sehen die Auswertung im Portal.
          </div>
        </div>
      </div>
      {byListing.size === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">💬</div>
            <div className="empty-text">Noch kein Feedback eingegangen.</div>
          </div>
        </div>
      ) : (
        [...byListing.entries()].map(([id, items]) => {
          const l = (listings ?? []).find((x) => x.id === id);
          return (
            <div key={id} className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="td-name" style={{ marginBottom: 12 }}>
                {l ? l.title || `${l.address}, ${l.city}` : "Objekt"}
              </div>
              <FeedbackSummary items={items} />
            </div>
          );
        })
      )}
    </div>
  );
}
