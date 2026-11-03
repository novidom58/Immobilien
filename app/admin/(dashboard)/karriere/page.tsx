import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/roles";
import { KarriereProgress } from "@/components/admin/KarriereProgress";
import { AnstellungSelect, ConfirmErtrag, DeleteErtrag, ErtragForm } from "@/components/admin/KarriereForms";
import {
  ANGESTELLT_ABZUG,
  BEISPIEL_PREIS,
  BEISPIEL_SATZ,
  HYPO_ERTRAG_PCT,
  STUFEN,
  chf,
  type Anstellung,
  type Posten,
} from "@/lib/karriere";
import { loadKarriere } from "@/lib/karriereData";

export const metadata: Metadata = {
  title: "Mein Stand — Admin",
  robots: { index: false, follow: false },
};

type Row = Record<string, unknown>;

const ART: Record<Posten["art"], string> = { immobilie: "Immobilie", versicherung: "Versicherung", hypothek: "Hypothek" };
const datum = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("de-CH");

/**
 * Leistungsstaffel: Mitarbeitende sehen ihren eigenen Stand (Anteil, was bis
 * zur nächsten Stufe fehlt, ihre Abschlüsse) und erfassen Versicherungs- und
 * Hypothekar-Abschlüsse. Partner wählen die Person und bestätigen Einträge.
 */
export default async function KarrierePage({ searchParams }: { searchParams: Promise<{ berater?: string }> }) {
  const supabase = await createClient();
  if (!supabase) return null;
  const staff = await getStaff(supabase);
  if (!staff) return null;
  const isPartner = staff.role === "admin";
  const { berater: wanted } = await searchParams;

  const { data: beraterRows } = await supabase.from("berater").select("*").order("name");
  const beraterList = ((beraterRows ?? []) as Row[]).map((b) => ({ name: b.name as string, anstellung: (b.anstellung as string | undefined) ?? "freelancer" }));

  const name = isPartner ? (wanted && beraterList.some((b) => b.name === wanted) ? wanted : staff.berater ?? beraterList[0]?.name) : staff.berater;

  if (!name) {
    return (
      <div className="card" style={{ padding: 20 }}>
        {isPartner ? "Lege zuerst unter «Berater» eine Person an." : "Deinem Login ist noch kein Berater zugeordnet. Bitte bei einem Partner melden."}
      </div>
    );
  }

  const anstellung = (beraterList.find((b) => b.name === name)?.anstellung === "angestellt" ? "angestellt" : "freelancer") as Anstellung;

  const { stand, offen, needsSql } = await loadKarriere(supabase, name, anstellung);
  const abzug = anstellung === "angestellt" ? ANGESTELLT_ABZUG : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{isPartner ? `Karrierestand: ${name}` : "Mein Stand"}</div>
          <div className="page-sub">Leistungsstaffel, gerechnet über die letzten 12 Monate inklusive des aktuellen Abschlusses</div>
        </div>
        {isPartner && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {beraterList.map((b) => (
              <Link key={b.name} href={`/admin/karriere?berater=${encodeURIComponent(b.name)}`} className={`btn btn-sm ${b.name === name ? "btn-primary" : "btn-ghost"}`}>
                {b.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {needsSql && (
        <div className="card" style={{ padding: 16, marginBottom: 16, fontSize: 13, color: "var(--red)" }}>
          Für Versicherungen, Hypotheken und Anstellungsart bitte in Supabase das SQL «Karriere» ausführen. Immobilien-Abschlüsse zählen schon.
        </div>
      )}

      {isPartner && (
        <div className="card" style={{ padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", fontSize: 13 }}>
          <span>Anstellung von {name}:</span>
          <AnstellungSelect key={name} berater={name} value={anstellung} />
        </div>
      )}

      <KarriereProgress
        immo={stand.immo}
        gesamt={stand.gesamt}
        stufeNr={stand.stufe.nr}
        stufen={STUFEN.map((s) => ({ ...s }))}
        abzug={abzug}
        fehltImmo={stand.fehltImmo}
        fehltGesamt={stand.fehltGesamt}
        verkaeufeBisNaechste={stand.verkaeufeBisNaechste}
        verdient={stand.verdient}
        beispiel={`à CHF ${BEISPIEL_PREIS.toLocaleString("de-CH")} zu ${String(BEISPIEL_SATZ).replace(".", ",")} %`}
      />

      {stand.faelltWeg.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16, fontSize: 13, borderColor: "rgba(199,138,58,.45)" }}>
          <strong>Achtung, das Fenster rollt:</strong>{" "}
          {stand.faelltWeg.map((p, i) => (
            <span key={p.id}>
              {i > 0 && "; "}«{p.titel}» ({chf(p.umsatz)}) zählt ab {new Date(p.ab).toLocaleDateString("de-CH")} nicht mehr
            </span>
          ))}
          . Mit neuen Abschlüssen bis dann hältst du deine Stufe.
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Abschlüsse der letzten 12 Monate</div>
            <div className="card-sub">Anteil = Stufe zum Zeitpunkt des Abschlusses. Verbindlich ist die Abrechnung.</div>
          </div>
        </div>
        {stand.posten.length === 0 ? (
          <div className="td-light" style={{ padding: 16, fontSize: 13 }}>
            Noch keine Abschlüsse erfasst. Verkäufe zählen, sobald beim Inserat unter «Abschluss &amp; Provision» Preis, Provision und Datum stehen.
          </div>
        ) : (
          <div className="crm-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Art</th>
                  <th>Objekt / Kunde</th>
                  <th>Volumen</th>
                  <th>Umsatz NoviDom</th>
                  <th>Anteil</th>
                  <th>Dein Anteil</th>
                </tr>
              </thead>
              <tbody>
                {stand.posten.map((p) => (
                  <tr key={`${p.art}-${p.id}`}>
                    <td>{datum(p.datum)}</td>
                    <td>{ART[p.art]}</td>
                    <td className="td-name">{p.titel}</td>
                    <td>{p.volumen ? chf(p.volumen) : "–"}</td>
                    <td>{chf(p.umsatz)}</td>
                    <td>{p.anteil} %</td>
                    <td>{chf(p.betrag)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!needsSql && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Versicherung oder Hypothek erfassen</div>
              <div className="card-sub">
                Zählt zum Gesamtumsatz. Bei Hypotheken ohne bekannte Entschädigung rechnen wir {String(HYPO_ERTRAG_PCT).replace(".", ",")} % vom Volumen.
              </div>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <ErtragForm berater={name} isPartner={isPartner} />
          </div>

          {offen.length > 0 && (
            <div className="crm-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Art</th>
                    <th>Kunde</th>
                    <th>Volumen / Prämie</th>
                    <th>{isPartner ? "Bestätigen" : "Status"}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {offen.map((e) => {
                    const vorschlag =
                      Number(e.ertrag_chf) ||
                      (e.art === "hypothek" && Number(e.volumen_chf) ? Math.round((Number(e.volumen_chf) * HYPO_ERTRAG_PCT) / 100) : null);
                    return (
                      <tr key={e.id as string}>
                        <td>{datum(e.abgeschlossen_am as string)}</td>
                        <td>{e.art === "hypothek" ? "Hypothek" : "Versicherung"}</td>
                        <td className="td-name">{(e.kunde as string) || "–"}</td>
                        <td>{Number(e.volumen_chf) ? chf(Number(e.volumen_chf)) : "–"}</td>
                        <td>{isPartner ? <ConfirmErtrag id={e.id as string} vorschlag={vorschlag} /> : <span className="badge badge-gold">wartet auf Bestätigung</span>}</td>
                        <td>
                          <DeleteErtrag id={e.id as string} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="td-light" style={{ fontSize: 12, lineHeight: 1.6 }}>
        Massgebend ist der Umsatz der letzten 12 Monate, inklusive des aktuellen Abschlusses. Es zählt der bessere von zwei Wegen: nur
        Immobilien-Provision (ab {chf(STUFEN[1].abImmo)} bzw. {chf(STUFEN[2].abImmo)}) oder Gesamtumsatz mit Versicherungen und Hypotheken (ab{" "}
        {chf(STUFEN[1].abGesamt)} bzw. {chf(STUFEN[2].abGesamt)}). Freelancer-Sätze; Angestellte je {ANGESTELLT_ABZUG} Punkte tiefer.
      </p>
    </div>
  );
}
