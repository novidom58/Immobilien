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
      <h1 className="font-display text-2xl font-semibold text-ivory">Newsletter-Abonnenten ({subscribers.length})</h1>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line">
        {subscribers.length === 0 ? (
          <p className="p-6 text-sm text-ivory-dim">Noch keine Anmeldungen.</p>
        ) : (
          <ul className="divide-y divide-line">
            {subscribers.map((s) => (
              <li key={s.email} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ivory">{s.email}</span>
                <span className="font-mono text-xs text-ivory-dim/60">
                  {s.source ?? "—"} · {new Date(s.created_at).toLocaleDateString("de-CH")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
