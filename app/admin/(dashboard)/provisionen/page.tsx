import type { Metadata } from "next";
import Link from "next/link";
import { ProvisionSplitCalc } from "@/components/admin/ProvisionSplitCalc";
import { ANGESTELLT_ABZUG, STUFEN, chf } from "@/lib/karriere";
import { BRINGER_FIN_PCT, BRINGER_IMMO_PCT, QUELLEN, VERKAEUFER_MAX, VERKAEUFER_MIN } from "@/lib/provisionen";

export const metadata: Metadata = {
  title: "Provisionen — Admin",
  robots: { index: false, follow: false },
};

const AUFTEILUNG = {
  immo: `Bringer ${BRINGER_IMMO_PCT} % · Verkäufer ${VERKAEUFER_MIN}–${VERKAEUFER_MAX} % · Rest Firma`,
  fin: `Bringer ${BRINGER_FIN_PCT} % · Firma ${100 - BRINGER_FIN_PCT} %`,
  firma: "Firma (Aufteilung noch offen)",
} as const;

/**
 * Provisionsliste für das Team: womit NoviDom Geld verdient, wie es
 * aufgeteilt wird, und ein Rechner für einzelne Abschlüsse.
 */
export default function ProvisionenPage() {
  const beispiel = 900_000 * 0.0095;
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Provisionen</div>
          <div className="page-sub">Womit wir Geld verdienen und wie wir es aufteilen. Basis ist immer der Betrag, der bei NoviDom eingeht.</div>
        </div>
        <Link href="/admin/karriere" className="btn btn-ghost btn-sm">
          Zur Karriere-Staffel →
        </Link>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginBottom: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Verkauf & Vermietung</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{BRINGER_IMMO_PCT} %</div>
          <div className="card-sub">an wer das Objekt bringt (Akquise, Mandat)</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {VERKAEUFER_MIN}–{VERKAEUFER_MAX} %
          </div>
          <div className="card-sub">an wer verkauft, je nach Stufe</div>
          <div style={{ fontSize: 13, marginTop: 10 }}>
            Rest an die Firma ({100 - BRINGER_IMMO_PCT - VERKAEUFER_MAX}–{100 - BRINGER_IMMO_PCT - VERKAEUFER_MIN} %). Bringt und verkauft die gleiche Person, erhält sie beide Anteile.
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Versicherungen</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{BRINGER_FIN_PCT} %</div>
          <div className="card-sub">der Courtage an wer den Kunden bringt</div>
          <div style={{ fontSize: 13, marginTop: 10 }}>{100 - BRINGER_FIN_PCT} % an die Firma. Gilt für Abschluss- und Bestandescourtage, privat und KMU.</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div className="card-title">Finanzierungen</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{BRINGER_FIN_PCT} %</div>
          <div className="card-sub">der Entschädigung an wer den Kunden bringt</div>
          <div style={{ fontSize: 13, marginTop: 10 }}>{100 - BRINGER_FIN_PCT} % an die Firma. Gilt für Kauf, Verlängerung und Aufstockung.</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Alle Einnahmequellen</div>
            <div className="card-sub">«Richtwert» heisst: Satz ist noch nicht verbindlich festgelegt, bitte im Mandat oder Partnervertrag festhalten.</div>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Quelle</th>
                <th>Ertrag</th>
                <th>Wofür</th>
                <th>Aufteilung</th>
              </tr>
            </thead>
            <tbody>
              {QUELLEN.map((q) => (
                <tr key={q.key}>
                  <td style={{ fontWeight: 600 }}>{q.titel}</td>
                  <td>
                    {q.ertrag}
                    {!q.festgelegt && (
                      <span className="badge badge-gold" style={{ marginLeft: 6 }}>
                        offen
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {q.basis}
                    {q.hinweis && <div style={{ color: "var(--ink-light)", marginTop: 2 }}>{q.hinweis}</div>}
                  </td>
                  <td style={{ fontSize: 13 }}>{AUFTEILUNG[q.aufteilung]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Verkäufer-Anteil nach Stufe</div>
            <div className="card-sub">
              Aus der Karriere-Staffel, rollend über 12 Monate. Angestellte erhalten {ANGESTELLT_ABZUG} Prozentpunkte weniger.
            </div>
          </div>
        </div>
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Stufe</th>
              <th>Anteil</th>
              <th>ab Immobilien-Umsatz</th>
              <th>Beispiel: CHF 900’000 zu 0,95 %</th>
            </tr>
          </thead>
          <tbody>
            {STUFEN.map((s) => (
              <tr key={s.nr}>
                <td>
                  {s.nr} · {s.titel}
                </td>
                <td>{s.anteil} %</td>
                <td>{s.abImmo ? chf(s.abImmo) : "Start"}</td>
                <td>
                  Verkäufer {chf((beispiel * s.anteil) / 100)} · Bringer {chf((beispiel * BRINGER_IMMO_PCT) / 100)} · Firma{" "}
                  {chf(beispiel * (1 - (s.anteil + BRINGER_IMMO_PCT) / 100))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProvisionSplitCalc />
    </div>
  );
}
