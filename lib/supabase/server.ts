import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Returns null when Supabase env vars aren't set yet. Callers must handle
 * the null case with a clear "not configured" state instead of crashing.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render; proxy.ts refreshes the
          // session cookie on the request/response instead.
        }
      },
    },
  });
}
