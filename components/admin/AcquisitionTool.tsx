"use client";

import { useMemo, useState } from "react";
import { Copy, Mail, Check } from "lucide-react";
import { logCustomerEmailActivity } from "@/app/admin/actions";

const OBJEKT_TYPES = ["Einfamilienhaus", "Eigentumswohnung", "Mehrfamilienhaus", "Renditeobjekt"];

function buildEmail({
  name,
  address,
  city,
  objektTyp,
  berater,
  note,
}: {
  name: string;
  address: string;
  city: string;
  objektTyp: string;
  berater: string;
  note: string;
}) {
  const anrede = name.trim() ? `Guten Tag ${name.trim()}` : "Guten Tag";
  const objektLine = address.trim() ? `Ihre Immobilie an der ${address.trim()}${city.trim() ? `, ${city.trim()}` : ""} ist uns dabei aufgefallen.` : "";

  const subject = `${address.trim() || "Ihre Immobilie"} – Verkauf zu fairen Konditionen?`;

  const body = [
    anrede,
    "",
    `Mein Name ist ${berater || "[Berater]"} von NoviDom Immo. Wir sind auf den Verkauf von ${objektTyp}-Objekten in der Nordwestschweiz und Zentralschweiz spezialisiert.`,
    objektLine,
    note.trim(),
    "",
    "Warum wir uns melden: Bei NoviDom zahlen Sie eine faire Provision ab 0.95% statt der klassischen 3% — bei vollem Service: bankanerkannte IAZI- und WUP-Bewertung, professionelle 360°-Aufnahmen mit Giraffe360, persönliche Begleitung bis zum Notartermin. Sie zahlen nur im Erfolgsfall.",
    "",
    "Unser Versprechen: Verkaufen wir Ihre Immobilie nicht innerhalb von 4 Monaten, übernehmen wir die Kosten für Fotos und 360°-Rundgang selbst.",
    "",
    "Hätten Sie Interesse an einer kostenlosen, unverbindlichen Einschätzung des aktuellen Marktwerts? Gerne melde ich mich telefonisch oder komme persönlich vorbei.",
    "",
    "Freundliche Grüsse",
    berater || "[Berater]",
    "NoviDom Immo · Basel & Zug",
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");

  return { subject, body };
}

export function AcquisitionTool({
  beraterOptions,
  initial,
  customerId,
}: {
  beraterOptions: string[];
  initial?: { name?: string; address?: string; city?: string; recipientEmail?: string; berater?: string };
  customerId?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [recipientEmail, setRecipientEmail] = useState(initial?.recipientEmail ?? "");
  const [objektTyp, setObjektTyp] = useState(OBJEKT_TYPES[0]);
  const [berater, setBerater] = useState<string>(initial?.berater || beraterOptions[0] || "");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const { subject, body } = useMemo(
    () => buildEmail({ name, address, city, objektTyp, berater, note }),
    [name, address, city, objektTyp, berater, note]
  );

  function logActivity() {
    if (customerId) void logCustomerEmailActivity(customerId, "Akquise-E-Mail versendet");
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    logActivity();
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return (
    <div className="card">
      <div className="grid gap-4 lg:grid-cols-2" style={{ padding: 20 }}>
        <div className="grid grid-cols-2 gap-2.5">
          <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} className="field-input" />
          <input placeholder="E-Mail Empfänger" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="field-input" />
          <input placeholder="Strasse & Hausnummer" value={address} onChange={(e) => setAddress(e.target.value)} className="field-input" />
          <input placeholder="PLZ / Ort" value={city} onChange={(e) => setCity(e.target.value)} className="field-input" />
          <select value={objektTyp} onChange={(e) => setObjektTyp(e.target.value)} className="field-select">
            {OBJEKT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={berater} onChange={(e) => setBerater(e.target.value)} className="field-select">
            {beraterOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Zusätzliche Notiz (optional, z.B. woher der Kontakt stammt)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="field-textarea col-span-2"
          />
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 16, background: "var(--bg)" }}>
          <div className="field-label">Betreff</div>
          <div className="mt-1" style={{ fontSize: 13 }}>{subject}</div>
          <div className="field-label mt-3">Text</div>
          <pre
            className="mt-1 whitespace-pre-wrap"
            style={{ maxHeight: 288, overflowY: "auto", fontFamily: "inherit", fontSize: 13, color: "var(--ink-mid)" }}
          >
            {body}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={handleCopy} className="btn btn-ghost btn-sm">
              {copied ? <Check className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />}
              {copied ? "Kopiert" : "Text kopieren"}
            </button>
            <a href={mailtoHref} onClick={logActivity} className="btn btn-primary btn-sm">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
              In E-Mail-Programm öffnen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
