import { createClient } from "@/lib/supabase/server";
import { daysSince } from "@/lib/dates";

type Supabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

export async function getLeadsWithActivity(supabase: Supabase) {
  const [leadsRes, activityRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, type, name, email, phone, message, status, wants_financing, follow_up_at, listing_id, source, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("lead_activity").select("id, lead_id, type, text, created_at").order("created_at", { ascending: false }),
  ]);

  const activityByLead = new Map<string, { id: string; type: string; text: string; created_at: string }[]>();
  for (const a of activityRes.data ?? []) {
    const list = activityByLead.get(a.lead_id) ?? [];
    list.push(a);
    activityByLead.set(a.lead_id, list);
  }

  return (leadsRes.data ?? []).map((l) => ({
    ...l,
    daysOpen: daysSince(l.created_at),
    activity: activityByLead.get(l.id) ?? [],
  }));
}

export type AdminLeadWithActivity = Awaited<ReturnType<typeof getLeadsWithActivity>>[number];

export async function getAllLeadsForStats(supabase: Supabase) {
  const { data } = await supabase.from("leads").select("id, source, status, created_at");
  return data ?? [];
}

export async function getListingsForAdmin(supabase: Supabase) {
  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, address, city, postal_code, status, owner_id, price_chf, property_type, rooms, living_area, description, tour_url, berater, activated_at, sale_deadline_months, posted_portals, lat, listing_photos(count), listing_documents(id, name, url)"
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((l) => ({
    id: l.id as string,
    title: (l.title as string | null) ?? null,
    address: l.address as string,
    city: l.city as string,
    postal_code: (l.postal_code as string | null) ?? null,
    status: l.status as string,
    property_type: (l.property_type as string) ?? "Haus",
    price_chf: (l.price_chf as number | null) ?? null,
    rooms: (l.rooms as number | null) ?? null,
    living_area: (l.living_area as number | null) ?? null,
    description: (l.description as string | null) ?? null,
    tour_url: (l.tour_url as string | null) ?? null,
    berater: (l.berater as string | null) ?? null,
    activated_at: (l.activated_at as string | null) ?? null,
    sale_deadline_months: (l.sale_deadline_months as number) ?? 4,
    posted_portals: (l.posted_portals as string[] | null) ?? [],
    ownerId: (l.owner_id as string | null) ?? null,
    lat: (l.lat as number | null) ?? null,
    photoCount: (l.listing_photos as { count: number }[] | null)?.[0]?.count ?? 0,
    hasOwner: Boolean(l.owner_id),
    documents: (l.listing_documents as { id: string; name: string; url: string }[] | null) ?? [],
  }));
}

export type AdminListing = Awaited<ReturnType<typeof getListingsForAdmin>>[number];

export async function getCustomers(supabase: Supabase) {
  const { data } = await supabase.rpc("admin_list_customers");
  return (data ?? []) as {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    birthdate: string | null;
    role: string;
    created_at: string;
  }[];
}

export async function getBeraterNames(supabase: Supabase) {
  const { data } = await supabase.from("berater").select("id, name").order("name");
  return (data ?? []) as { id: string; name: string }[];
}

export async function getNewsletterSubscribers(supabase: Supabase) {
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("email, source, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export function dueTodayLeads(leads: AdminLeadWithActivity[]) {
  const todayStr = new Date().toISOString().slice(0, 10);
  return leads.filter((l) => l.follow_up_at && l.follow_up_at <= todayStr);
}

export function overdueLeads(leads: AdminLeadWithActivity[]) {
  return leads.filter((l) => (l.status === "neu" || l.status === "kontaktiert") && l.daysOpen >= 3);
}

export function viewingRequestLeads(leads: AdminLeadWithActivity[]) {
  return leads.filter((l) => l.listing_id && l.status !== "abgeschlossen" && l.status !== "irrelevant");
}
