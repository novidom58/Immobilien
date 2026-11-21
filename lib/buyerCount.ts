import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Ab so vielen vorgemerkten Käufern zeigt die Startseite den Käufer-Radar. */
export const RADAR_MIN_KAEUFER = 15;

/**
 * Anzahl vorgemerkter Käufer mit Suchprofil (Kunden mit Ziel «kaufen»).
 * Am Anfang wäre der Radar meist leer und würde «0 Käufer» zeigen, darum
 * erscheint er erst, wenn die Kartei genug Suchprofile hat.
 */
export async function buyerCount(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 0;
  const admin = createSupabaseClient(url, key);
  const { count } = await admin.from("customers").select("id", { count: "exact", head: true }).eq("ziel", "kaufen").neq("typ", "ex");
  return count ?? 0;
}
