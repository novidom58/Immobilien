import { redirect } from "next/navigation";
import type { createClient } from "@/lib/supabase/server";

/** Seiten nur für Partner (role admin); Mitarbeitende sehen sie nicht. */
export const PARTNER_ONLY = ["/admin/dashboard", "/admin/mitarbeiter", "/admin/import", "/admin/berater", "/admin/mailvorlagen", "/admin/newsletter", "/admin/kanaele"];

export type StaffRole = "admin" | "mitarbeiter";

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

/** Rolle und Berater-Name der angemeldeten Person (null = kein Team-Mitglied). */
export async function getStaff(supabase: Supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const role = profile?.role as string | undefined;
  if (role !== "admin" && role !== "mitarbeiter") return null;
  return { user, role: role as StaffRole, berater: (profile?.berater_name as string | null) ?? null };
}

/** Für Partner-Seiten: Mitarbeitende zurück auf «Heute». */
export async function requirePartnerPage(supabase: Supabase) {
  const staff = await getStaff(supabase);
  if (staff?.role !== "admin") redirect("/admin");
  return staff;
}
