import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns null when Supabase env vars aren't set yet (e.g. before the user
 * has created a Supabase project). Callers must handle the null case with a
 * clear "not configured" state instead of crashing.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
