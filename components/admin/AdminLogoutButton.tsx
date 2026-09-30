"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  if (!supabase) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      className="crm-topbar-logout"
    >
      Abmelden
    </button>
  );
}
