"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkImportCustomers } from "@/app/admin/actions";

type Row = { name: string; email: string; phone: string; message: string };

const NAME_KEYS = ["name", "vorname"];
const LASTNAME_KEYS = ["nachname"];
const EMAIL_KEYS = ["email", "e-mail", "mail"];
const PHONE_KEYS = ["telefon", "phone", "tel"];
const NOTE_KEYS = ["notiz", "notizen", "nachricht", "bemerkung"];

function detectDelimiter(line: string): string {
  return (line.match(/;/g)?.length ?? 0) >= (line.match(/,/g)?.length ?? 0) ? ";" : ",";
}

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase());

  const findIndex = (keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k)));
  const nameIdx = findIndex(NAME_KEYS);
  const lastnameIdx = findIndex(LASTNAME_KEYS);
  const emailIdx = findIndex(EMAIL_KEYS);
  const phoneIdx = findIndex(PHONE_KEYS);
  const noteIdx = findIndex(NOTE_KEYS);

  return lines.slice(1).map((line) => {
    const cells = line.split(delimiter).map((c) => c.trim());
    const first = nameIdx >= 0 ? cells[nameIdx] ?? "" : "";
    const last = lastnameIdx >= 0 ? cells[lastnameIdx] ?? "" : "";
    return {
      name: [first, last].filter(Boolean).join(" "),
      email: emailIdx >= 0 ? cells[emailIdx] ?? "" : "",
      phone: phoneIdx >= 0 ? cells[phoneIdx] ?? "" : "",
      message: noteIdx >= 0 ? cells[noteIdx] ?? "" : "",
    };
  });
}

export function CsvImportTool() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const parsed = parseCsv(text);
      if (parsed.length === 0) {
        setError("Keine Zeilen erkannt — bitte Format prüfen (erste Zeile = Spaltenüberschriften).");
        setRows([]);
        return;
      }
      setRows(parsed);
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleImport() {
    setBusy(true);
    setError(null);
    const res = await bulkImportCustomers(rows);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setResult(`${res.count} Kunde${res.count === 1 ? "" : "n"} importiert.`);
    setRows([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <div className="card-header">
        <div className="card-title">CSV-Datei hochladen</div>
      </div>
      <div style={{ padding: 20 }}>
        <p className="td-light" style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>
          Die CSV-Datei muss folgende Spalten haben (Reihenfolge egal, Trennzeichen: Semikolon oder Komma):{" "}
          <strong>Name (oder Vorname/Nachname), Email, Telefon, Notizen</strong>
        </p>
        <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📥</div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost">
            CSV-Datei auswählen
          </button>
          <div className="td-light" style={{ fontSize: 12, marginTop: 8 }}>
            {fileName || "Keine Datei ausgewählt"}
          </div>
        </div>

        {rows.length > 0 && (
          <div>
            <div className="crm-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>E-Mail</th>
                    <th>Telefon</th>
                    <th>Notiz</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r, i) => (
                    <tr key={i}>
                      <td className="td-name">{r.name || "—"}</td>
                      <td className="td-light">{r.email || "—"}</td>
                      <td className="td-light">{r.phone || "—"}</td>
                      <td className="td-light">{r.message || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 20 && (
              <p className="td-light" style={{ fontSize: 11, marginTop: 6 }}>
                … und {rows.length - 20} weitere Zeilen.
              </p>
            )}
            <div className="flex items-center gap-3" style={{ marginTop: 16 }}>
              <button type="button" disabled={busy} onClick={handleImport} className="btn btn-primary">
                {busy ? "Importiert…" : `✓ ${rows.length} Zeilen importieren`}
              </button>
              <button type="button" onClick={() => setRows([])} className="btn btn-ghost">
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {error && (
          <p style={{ marginTop: 14, fontSize: 13, color: "var(--red)" }}>{error}</p>
        )}
        {result && (
          <p style={{ marginTop: 14, fontSize: 13, color: "var(--green)" }}>{result}</p>
        )}
      </div>
    </div>
  );
}
