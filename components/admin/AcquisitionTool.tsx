"use client";

import { useMemo, useState } from "react";
import { Copy, Mail, Check } from "lucide-react";
import { BERATER_OPTIONS } from "@/app/admin/actions";

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

export function AcquisitionTool() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [objektTyp, setObjektTyp] = useState(OBJEKT_TYPES[0]);
  const [berater, setBerater] = useState<string>(BERATER_OPTIONS[0]);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const { subject, body } = useMemo(
    () => buildEmail({ name, address, city, objektTyp, berater, note }),
    [name, address, city, objektTyp, berater, note]
  );

  async function handleCopy() {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const mailtoHref = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  const fieldClasses =
    "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

  return (
    <div className="rounded-2xl border border-line bg-ink-2 p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-2.5">
          <input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} className={fieldClasses} />
          <input placeholder="E-Mail Empfänger" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className={fieldClasses} />
          <input placeholder="Strasse & Hausnummer" value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClasses} />
          <input placeholder="PLZ / Ort" value={city} onChange={(e) => setCity(e.target.value)} className={fieldClasses} />
          <select value={objektTyp} onChange={(e) => setObjektTyp(e.target.value)} className={fieldClasses}>
            {OBJEKT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={berater} onChange={(e) => setBerater(e.target.value)} className={fieldClasses}>
            {BERATER_OPTIONS.map((b) => (
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
            className={`${fieldClasses} col-span-2 resize-none`}
          />
        </div>

        <div className="rounded-xl border border-line bg-ink p-4">
          <div className="font-mono text-xs uppercase tracking-wide text-ivory-dim/60">Betreff</div>
          <div className="mt-1 text-sm text-ivory">{subject}</div>
          <div className="mt-3 font-mono text-xs uppercase tracking-wide text-ivory-dim/60">Text</div>
          <pre className="mt-1 max-h-72 overflow-y-auto whitespace-pre-wrap font-sans text-sm text-ivory-dim">{body}</pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs text-ivory-dim hover:border-amber/50 hover:text-ivory"
            >
              {copied ? <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
              {copied ? "Kopiert" : "Text kopieren"}
            </button>
            <a
              href={mailtoHref}
              className="flex items-center gap-1.5 rounded-lg bg-amber px-3 py-2 text-xs font-semibold text-ink"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              In E-Mail-Programm öffnen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
