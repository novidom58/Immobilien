"use client";

import { useEffect, useState } from "react";
import { getPortalSnapshot, type PortalSnapshot } from "@/app/admin/actions";

const chf = (v: unknown) => (typeof v === "number" && v > 0 ? `CHF ${v.toLocaleString("de-CH")}` : null);
const date = (v: unknown) => (typeof v === "string" && v ? new Date(v).toLocaleDateString("de-CH") : null);

const SITUATION: Record<string, string> = { miete: "Mietet", kauf: "Plant Kauf", eigentum: "Hat Eigentum" };

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 8, fontSize: 13, padding: "3px 0" }}>
      <span className="td-light">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div className="detail-label" style={{ marginBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/** Was der Kunde im Kundenportal selbst eingegeben hat (nur lesen, immer aktuell). */
export function PortalSnapshotPanel({ customerId }: { customerId: string }) {
  const [data, setData] = useState<PortalSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPortalSnapshot(customerId).then((res) => {
      if (!active) return;
      if (res.error) setError(res.error);
      else setData(res.data);
    });
    return () => {
      active = false;
    };
  }, [customerId]);

  if (error) return <p style={{ fontSize: 12, color: "var(--red)" }}>{error}</p>;
  if (!data) return <p className="td-light" style={{ fontSize: 12 }}>Portal-Daten werden geladen …</p>;
  if (!data.linked) {
    return (
      <p className="td-light" style={{ fontSize: 12.5 }}>
        Noch kein Kundenkonto. Sobald sich die Person mit {data.email ?? "ihrer E-Mail"} registriert, erscheinen ihre Angaben hier.
      </p>
    );
  }

  const p = data.plan;
  const f = p?.finanz ?? null;
  const v = p?.versicherung ?? null;
  const e = p?.eigentum ?? null;
  const hasSearch = p && (p.wunsch_ort || p.objekt_typ || p.zimmer_min || p.budget_max || p.kauf_zeitpunkt);

  return (
    <div>
      <Block title="Konto">
        <Row label="Name" value={data.profile?.full_name} />
        <Row label="E-Mail" value={data.email} />
        <Row label="Telefon" value={data.profile?.phone} />
        <Row label="Geburtsdatum" value={date(data.profile?.birthdate)} />
        <Row label="Zuletzt geändert" value={date(p?.updated_at)} />
      </Block>

      {hasSearch && (
        <Block title="Suchprofil">
          <Row label="Ort / Region" value={p?.wunsch_ort} />
          <Row label="Objektart" value={p?.objekt_typ} />
          <Row label="Zimmer ab" value={p?.zimmer_min ? String(p.zimmer_min) : null} />
          <Row label="Budget bis" value={chf(p?.budget_max)} />
          <Row label="Zeitpunkt" value={p?.kauf_zeitpunkt} />
          <Row label="Käufer-Alarm" value={p?.alarm_opt_in ? "Ja, möchte Angebote erhalten" : "Nein"} />
        </Block>
      )}

      {f && (
        <Block title="Finanzierungs-Check">
          <Row label="Einkommen / Jahr" value={chf(f.income)} />
          <Row label="Erspartes" value={chf(f.savings)} />
          <Row label="Pensionskasse" value={chf(f.pension)} />
          <Row label="Wunschpreis" value={chf(f.price)} />
          <Row label="Max. Kaufpreis" value={chf(f.max_price)} />
          <Row label="Gespeichert am" value={date(f.saved_at)} />
        </Block>
      )}

      {e && (
        <Block title="Mein Eigentum (Wertmonitor)">
          <Row label="Adresse" value={typeof e.adresse === "string" ? e.adresse : null} />
          <Row label="Region / Art" value={[e.region, e.typ].filter(Boolean).join(" · ") || null} />
          <Row label="Wohnfläche" value={e.flaeche ? `${e.flaeche} m²` : null} />
          <Row label="Zimmer / Baujahr" value={[e.zimmer, e.baujahr].filter(Boolean).join(" · ") || null} />
          <Row label="Richtwert" value={chf(e.wert)} />
          <Row label="Hypothek bis" value={date(e.hypo_ablauf)} />
          <Row label="Hypothek" value={chf(e.hypo_betrag)} />
        </Block>
      )}

      {v && (
        <Block title="Versicherungs-Check">
          <Row label="Situation" value={SITUATION[String(v.situation)] ?? null} />
          <Row label="Objekt" value={v.objekt ? String(v.objekt) === "haus" ? "Haus" : "Wohnung" : null} />
          <Row
            label="Angaben"
            value={[v.umbau && "Umbau geplant", v.wertsachen && "Wertsachen", v.tiere && "Haustiere"].filter(Boolean).join(", ") || null}
          />
        </Block>
      )}

      {data.favorites.length > 0 && (
        <Block title={`Merkliste (${data.favorites.length})`}>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>{data.favorites.map((x) => x.label).join(" · ")}</div>
        </Block>
      )}

      {!hasSearch && !f && !e && !v && data.favorites.length === 0 && (
        <p className="td-light" style={{ fontSize: 12.5, marginTop: 8 }}>
          Konto vorhanden, aber im Portal noch nichts ausgefüllt.
        </p>
      )}
    </div>
  );
}
