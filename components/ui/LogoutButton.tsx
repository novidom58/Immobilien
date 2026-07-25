"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const supabase = createClient();

  if (!supabase) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push(redirectTo);
        router.refresh();
      }}
      className="font-mono text-xs uppercase tracking-wide text-ivory-dim hover:text-ivory"
    >
      Abmelden
    </button>
  );
}
