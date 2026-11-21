import { createClient } from "@/lib/supabase/server";

// Kennzahlen pro Monat als CSV für die gemeinsame Übersicht mit HypoCasa.
// Bewusst NUR Anzahlen, keine Namen, E-Mails oder andere Personendaten:
// HypoCasa führt ein eigenes CRM, Personendaten werden nicht zusammengeführt.
// Nur für Partner.

type Row = Record<string, unknown>;

const monat = (iso: unknown) => (typeof iso === "string" ? iso.slice(0, 7) : "");
const finanzBezug = (l: Row) => {
  const text = `${l.source ?? ""} ${l.message ?? ""}`.toLowerCase();
  return l.wants_financing === true || /finanz|hypothek|versicher/.test(text);
};

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return new Response("Nicht eingerichtet.", { status: 503 });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Nicht angemeldet.", { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return new Response("Nur für Partner.", { status: 403 });

  // Letzte 12 Monate inkl. laufendem Monat
  const now = new Date();
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  const since = `${months[0]}-01`;

  const [leadsRes, customersRes, termineRes, dealsRes] = await Promise.all([
    supabase.from("leads").select("created_at, type, source, message, wants_financing").gte("created_at", since).limit(20000),
    supabase.from("customers").select("created_at").gte("created_at", since).limit(20000),
    supabase.from("termine").select("starts_at, type").eq("type", "besichtigung").gte("starts_at", since).limit(20000),
    supabase.from("listing_deals").select("sold_at, listings(offer_type)").gte("sold_at", since).limit(5000),
  ]);

  const leads = (leadsRes.data ?? []) as Row[];
  const customers = (customersRes.data ?? []) as Row[];
  const termine = (termineRes.data ?? []) as Row[];
  const deals = (dealsRes.data ?? []) as Row[];
  const miete = (d: Row) => (d.listings as { offer_type?: string } | null)?.offer_type === "miete";

  const header = ["Monat", "Firma", "Anfragen", "davon Bewertung", "davon mit Finanzierungs-/Versicherungsbezug", "Neue Kunden", "Besichtigungen", "Abschlüsse Verkauf", "Abschlüsse Vermietung"];
  const lines = months.map((m) => {
    const l = leads.filter((x) => monat(x.created_at) === m);
    const d = deals.filter((x) => monat(x.sold_at) === m);
    return [
      m,
      "NoviDom",
      l.length,
      l.filter((x) => x.type === "valuation").length,
      l.filter(finanzBezug).length,
      customers.filter((x) => monat(x.created_at) === m).length,
      termine.filter((x) => monat(x.starts_at) === m).length,
      d.filter((x) => !miete(x)).length,
      d.filter(miete).length,
    ].join(";");
  });

  const csv = "﻿" + [header.join(";"), ...lines].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="novidom-kennzahlen-${months[11]}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
