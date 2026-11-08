"use client";

import { useState } from "react";
import {
  ERWERB_OPTIONS,
  OBJEKT_DOCS_OPTIONS,
  OBJEKT_OPTIONS,
  VORHABEN_OPTIONS,
  bankUnterlagenText,
  type Erwerb,
  type Objekt,
  type ObjektDocs,
  type Vorhaben,
} from "@/lib/bankUnterlagen";

/** Unterlagen für die Bank anfordern: Text je nach Situation, kopieren oder per Mail. */
export function BankDocsRequest({ email, name }: { email?: string | null; name?: string | null }) {
  const [open, setOpen] = useState(false);
  const [erwerb, setErwerb] = useState<Erwerb>("angestellt");
  const [objekt, setObjekt] = useState<Objekt>("normal");
  const [vorhaben, setVorhaben] = useState<Vorhaben>("kauf");
  const [objektDocs, setObjektDocs] = useState<ObjektDocs>("einzeln");
  const [copied, setCopied] = useState(false);
  const body = `Guten Tag${name ? ` ${name}` : ""}\n\n${bankUnterlagenText({ erwerb, objekt, vorhaben, objektDocs })}\n\nFreundliche Grüsse\nNoviDom Immobilien AG`;

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        Unterlagen für die Bank anfordern
      </button>
    );
  }

  const sel = (label: string, value: string, set: (v: string) => void, options: { value: string; label: string }[]) => (
    <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-light)" }}>
      {label}
      <select value={value} onChange={(e) => set(e.target.value)} className="field-select" style={{ display: "block", width: "100%", marginTop: 4, textTransform: "none", letterSpacing: 0 }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div style={{ marginTop: 10, width: "100%" }}>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        {sel("Wovon lebt die Person", erwerb, (v) => setErwerb(v as Erwerb), ERWERB_OPTIONS)}
        {sel("Was für ein Objekt", objekt, (v) => setObjekt(v as Objekt), OBJEKT_OPTIONS)}
        {sel("Vorhaben", vorhaben, (v) => setVorhaben(v as Vorhaben), VORHABEN_OPTIONS)}
        {sel("Objektunterlagen", objektDocs, (v) => setObjektDocs(v as ObjektDocs), OBJEKT_DOCS_OPTIONS)}
      </div>
      <textarea readOnly value={body} rows={14} className="field-textarea" style={{ width: "100%", marginTop: 10, fontSize: 13 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {email && (
          <a className="btn btn-primary btn-sm" href={`mailto:${email}?subject=${encodeURIComponent("Unterlagen für Ihre Finanzierung")}&body=${encodeURIComponent(body)}`}>
            Per Mail senden
          </a>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigator.clipboard?.writeText(body).then(() => (setCopied(true), setTimeout(() => setCopied(false), 2000)))}
        >
          {copied ? "Kopiert ✓" : "Text kopieren"}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
          Schliessen
        </button>
      </div>
    </div>
  );
}
