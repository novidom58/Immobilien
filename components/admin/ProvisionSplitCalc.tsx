"use client";

import { useState } from "react";
import { aufteilen, BRINGER_FIN_PCT, BRINGER_IMMO_PCT, QUELLEN, VERKAEUFER_MAX, VERKAEUFER_MIN } from "@/lib/provisionen";
import { STUFEN, chf } from "@/lib/karriere";

const num = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;

/** Rechner: Was erhält wer bei einem Abschluss? */
export function ProvisionSplitCalc() {
  const [quelle, setQuelle] = useState("verkauf");
  const [preis, setPreis] = useState("900000");
  const [satz, setSatz] = useState("0.95");
  const [betrag, setBetrag] = useState("1500");
  const [verkaeufer, setVerkaeufer] = useState(String(VERKAEUFER_MIN));
  const [gleichePerson, setGleichePerson] = useState(false);

  const q = QUELLEN.find((x) => x.key === quelle) ?? QUELLEN[0];
  const total = quelle === "verkauf" ? (num(preis) * num(satz)) / 100 : num(betrag);
  const split = aufteilen(total, q.aufteilung, Number(verkaeufer));

  const rows =
    q.aufteilung === "immo"
      ? gleichePerson
        ? [
            { wer: `Bringer und Verkäufer (gleiche Person, ${BRINGER_IMMO_PCT} + ${verkaeufer} %)`, chf: split.bringer + split.verkaeufer },
            { wer: "Firma NoviDom", chf: split.firma },
          ]
        : [
            { wer: `Bringer (${BRINGER_IMMO_PCT} %)`, chf: split.bringer },
            { wer: `Verkäufer (${verkaeufer} %)`, chf: split.verkaeufer },
            { wer: "Firma NoviDom", chf: split.firma },
          ]
      : q.aufteilung === "fin"
        ? [
            { wer: `Bringer (${BRINGER_FIN_PCT} %)`, chf: split.bringer },
            { wer: `Firma NoviDom (${100 - BRINGER_FIN_PCT} %)`, chf: split.firma },
          ]
        : [{ wer: "Firma NoviDom (Aufteilung noch offen)", chf: split.firma }];

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="card-title">Rechner: Wer erhält wie viel?</div>
      <div className="card-sub" style={{ marginBottom: 14 }}>
        Basis ist der Betrag, der bei NoviDom eingeht. Verbindlich ist die Abrechnung.
      </div>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", alignItems: "end" }}>
        <label style={{ fontSize: 12 }}>
          Art
          <select className="field-select" value={quelle} onChange={(e) => setQuelle(e.target.value)} style={{ width: "100%" }}>
            {QUELLEN.map((x) => (
              <option key={x.key} value={x.key}>
                {x.titel}
              </option>
            ))}
          </select>
        </label>
        {quelle === "verkauf" ? (
          <>
            <label style={{ fontSize: 12 }}>
              Verkaufspreis CHF
              <input className="field-input" inputMode="numeric" value={preis} onChange={(e) => setPreis(e.target.value)} style={{ width: "100%" }} />
            </label>
            <label style={{ fontSize: 12 }}>
              Provision %
              <input className="field-input" inputMode="decimal" value={satz} onChange={(e) => setSatz(e.target.value)} style={{ width: "100%" }} />
            </label>
          </>
        ) : (
          <label style={{ fontSize: 12 }}>
            Betrag bei NoviDom (CHF)
            <input className="field-input" inputMode="numeric" value={betrag} onChange={(e) => setBetrag(e.target.value)} style={{ width: "100%" }} />
          </label>
        )}
        {q.aufteilung === "immo" && (
          <label style={{ fontSize: 12 }}>
            Verkäufer-Anteil ({VERKAEUFER_MIN}–{VERKAEUFER_MAX} %)
            <select className="field-select" value={verkaeufer} onChange={(e) => setVerkaeufer(e.target.value)} style={{ width: "100%" }}>
              {STUFEN.map((s) => (
                <option key={s.nr} value={s.anteil}>
                  {s.anteil} % · {s.titel}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {q.aufteilung === "immo" && (
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, marginTop: 12 }}>
          <input type="checkbox" checked={gleichePerson} onChange={(e) => setGleichePerson(e.target.checked)} />
          Bringer und Verkäufer sind die gleiche Person
        </label>
      )}

      <table style={{ marginTop: 16, width: "100%" }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600 }}>Eingang bei NoviDom</td>
            <td style={{ textAlign: "right", fontWeight: 600 }}>{chf(total)}</td>
          </tr>
          {rows.map((r) => (
            <tr key={r.wer}>
              <td>{r.wer}</td>
              <td style={{ textAlign: "right" }}>{chf(r.chf)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
