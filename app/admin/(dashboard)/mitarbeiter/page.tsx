import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { requirePartnerPage } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Mitarbeitende — Admin",
  robots: { index: false, follow: false },
};

type Row = Record<string, unknown>;

const chf = (n: number) => `CHF ${Math.round(n).toLocaleString("de-CH")}`;
const DAY = 24 * 3600 * 1000;

/**
 * Kennzahlen pro Berater/in für die Partner: Bestand, Eigenakquise, Abschlüsse
 * und Provision der letzten 12 Monate, Leads, Reaktionszeit, Abschlussquote,
 * Besichtigungen und vermittelte Hypotheken. Grundlage ist die Zuteilung
 * «Berater» bei Objekten, Leads, Kunden und Terminen.
 */
export default async function AdminMitarbeiterPage() {
  const supabase = await createClient();
  if (!supabase) return null;
  await requirePartnerPage(supabase);

  const [beraterRes, listingsRes, dealsRes, leadsRes, activityRes, customersRes, termineRes] = await Promise.all([
    supabase.from("berater").select("name").order("name"),
    supabase.from("listings").select("id, berater, status, offer_type"),
    supabase.from("listing_deals").select("*"),
    supabase.from("leads").select("*").limit(5000),
    supabase.from("lead_activity").select("lead_id, created_at").order("created_at", { ascending: true }),
    supabase.from("customers").select("*"),
    supabase.from("termine").select("berater, starts_at, type"),
  ]);

  const needsSql = Boolean(dealsRes.error);
  const names = (beraterRes.data ?? []).map((b) => b.name as string);
  const listings = (listingsRes.data ?? []) as Row[];
  const deals = new Map(((dealsRes.data ?? []) as Row[]).map((d) => [d.listing_id as string, d]));
  const leads = ((leadsRes.data ?? []) as Row[]).filter((l) => !l.archived_at);
  const customers = (customersRes.data ?? []) as Row[];
  const termine = (termineRes.data ?? []) as Row[];

  const firstContact = new Map<string, number>();
  for (const a of (activityRes.data ?? []) as Row[]) {
    const id = a.lead_id as string;
    if (!firstContact.has(id)) firstContact.set(id, new Date(a.created_at as string).getTime());
  }

  const now = new Date().getTime();
  const yearAgo = now - 365 * DAY;

  const rows = names.map((name) => {
    const own = listings.filter((l) => l.berater === name);
    const bestand = own.filter((l) => l.status === "active" || l.status === "reserved");
    const selfAcquired = own.filter((l) => Boolean(deals.get(l.id as string)?.self_acquired)).length;
    const closed = own
      .map((l) => ({ l, d: deals.get(l.id as string) }))
      .filter(({ d }) => d?.sold_at && new Date(d.sold_at as string).getTime() >= yearAgo);
    const umsatz = closed.reduce((sum, { d }) => sum + ((Number(d?.sold_price) || 0) * (Number(d?.commission_pct) || 0)) / 100, 0);

    const ownLeads = leads.filter((l) => l.berater === name);
    const openLeads = ownLeads.filter((l) => l.status === "neu" || l.status === "kontaktiert" || l.status === "termin").length;
    const reaction = ownLeads
      .map((l) => {
        const first = firstContact.get(l.id as string);
        return first ? (first - new Date(l.created_at as string).getTime()) / 3600000 : null;
      })
      .filter((h): h is number => h !== null && h >= 0);
    const avgReaction = reaction.length ? reaction.reduce((a, b) => a + b, 0) / reaction.length : null;

    const ownCustomers = customers.filter((c) => c.berater === name);
    const leadIds = new Set(ownLeads.map((l) => l.id as string));
    const fromLeads = ownCustomers.filter((c) => c.source_lead_id && leadIds.has(c.source_lead_id as string)).length;
    const mandates = ownCustomers.filter((c) => c.listing_id).length;
    const hypotheken = ownCustomers.filter((c) => c.finanz_status === "bestaetigt").length;

    const besichtigungen = termine.filter(
      (t) => t.berater === name && t.type === "besichtigung" && Math.abs(new Date(t.starts_at as string).getTime() - now) <= 30 * DAY
    ).length;

    return {
      name,
      bestand: bestand.length,
      selfAcquired,
      abschluesse: closed.length,
      umsatz,
      leads: ownLeads.length,
      openLeads,
      avgReaction,
      leadToCustomer: ownLeads.length ? Math.round((fromLeads / ownLeads.length) * 100) : null,
      customers: ownCustomers.length,
      mandates,
      hypotheken,
      besichtigungen,
    };
  });

  const unassignedLeads = leads.filter((l) => !l.berater).length;
  const totalUmsatz = rows.reduce((s, r) => s + r.umsatz, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Mitarbeitende</div>
          <div className="page-sub">Kennzahlen pro Person, Grundlage ist die Zuteilung «Berater» bei Objekten, Leads, Kunden und Terminen</div>
        </div>
      </div>

      {needsSql && (
        <div className="card" style={{ padding: 16, marginBottom: 16, fontSize: 13, color: "var(--red)" }}>
          Für Umsatz und Eigenakquise bitte zuerst in Supabase das SQL «Rollen und Mitarbeitende» ausführen.
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi blue">
          <div className="kpi-num">{chf(totalUmsatz)}</div>
          <div className="kpi-label">Provision letzte 12 Monate</div>
          <div className="kpi-sub">aus erfassten Abschlüssen</div>
        </div>
        <div className="kpi">
          <div className="kpi-num">{rows.reduce((s, r) => s + r.bestand, 0)}</div>
          <div className="kpi-label">Objekte im Bestand</div>
          <div className="kpi-sub">aktiv und reserviert</div>
        </div>
        <div className="kpi">
          <div className="kpi-num">{unassignedLeads}</div>
          <div className="kpi-label">Leads ohne Zuteilung</div>
          <div className="kpi-sub">unter Leads zuteilen</div>
        </div>
      </div>

      <div className="card">
        <div className="crm-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Person</th>
                <th>Bestand</th>
                <th>Eigenakquise</th>
                <th>Abschlüsse 12 Mt.</th>
                <th>Provision 12 Mt.</th>
                <th>Leads offen / total</th>
                <th>Ø erste Reaktion</th>
                <th>Lead → Kunde</th>
                <th>Kunden / Mandate</th>
                <th>Besichtigungen ±30 T.</th>
                <th>Hypotheken</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td className="td-name">
                    <Link href={`/admin/karriere?berater=${encodeURIComponent(r.name)}`} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                      {r.name}
                    </Link>
                  </td>
                  <td>{r.bestand}</td>
                  <td>{r.selfAcquired}</td>
                  <td>{r.abschluesse}</td>
                  <td>{r.umsatz > 0 ? chf(r.umsatz) : "–"}</td>
                  <td>
                    {r.openLeads} / {r.leads}
                  </td>
                  <td>{r.avgReaction === null ? "–" : r.avgReaction < 48 ? `${Math.round(r.avgReaction)} Std.` : `${Math.round(r.avgReaction / 24)} Tage`}</td>
                  <td>{r.leadToCustomer === null ? "–" : `${r.leadToCustomer} %`}</td>
                  <td>
                    {r.customers} / {r.mandates}
                  </td>
                  <td>{r.besichtigungen}</td>
                  <td>{r.hypotheken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="td-light" style={{ fontSize: 12, marginTop: 12, lineHeight: 1.6 }}>
        Provision = Verkaufspreis × Provisionssatz aus «Abschluss &amp; Provision» beim Inserat. Eigenakquise zählt Objekte mit dem
        Häkchen «Mandat selbst akquiriert». Reaktionszeit = Zeit vom Eingang bis zum ersten Eintrag in der Lead-Historie. Neue Personen
        legt ihr unter Berater an und ladet sie dort als Mitarbeiter/in ein.
      </p>
    </div>
  );
}
