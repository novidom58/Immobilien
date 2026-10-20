"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type ChecklistItem = { key: string; label: string; hint?: string };

export const FINANZ_UNTERLAGEN: ChecklistItem[] = [
  { key: "Ausweis", label: "Pass oder ID" },
  { key: "Lohnausweis", label: "Lohnausweis", hint: "letzte 1–2 Jahre, bei Selbständigen die Abschlüsse" },
  { key: "Steuererklärung", label: "Steuererklärung", hint: "die aktuellste" },
  { key: "Betreibungsauszug", label: "Betreibungsauszug", hint: "nicht älter als 3 Monate" },
  { key: "Eigenmittel", label: "Nachweis Eigenmittel", hint: "Konto, 3a, Wertschriften" },
  { key: "Pensionskasse", label: "Pensionskassenausweis", hint: "falls Sie PK-Geld einsetzen" },
  { key: "Objekt", label: "Objektunterlagen", hint: "Verkaufsdokumentation, Grundriss, Grundbuchauszug" },
];

export const POLICEN: ChecklistItem[] = [
  { key: "Police Gebäude", label: "Gebäudeversicherung / Gebäudewasser" },
  { key: "Police Hausrat", label: "Hausrat & Privathaftpflicht" },
  { key: "Police Rechtsschutz", label: "Rechtsschutz" },
  { key: "Police Auto", label: "Auto & Kasko" },
  { key: "Police Leben", label: "Lebens- oder Erwerbsunfähigkeitsversicherung" },
  { key: "Police 3a", label: "Säule 3a" },
];

type Doc = { id: string; name: string };

/**
 * Checkliste für Unterlagen: pro Punkt direkt hochladen, erledigte Punkte
 * werden abgehakt. Nutzt denselben Speicher wie «Ihre Unterlagen»; der
 * Dateiname bekommt den Punkt als Präfix, damit wir ihn im Admin zuordnen.
 */
export function DocChecklist({ title, intro, items }: { title: string; intro?: string; items: ChecklistItem[] }) {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const target = useRef<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("user_documents").select("id, name");
    setDocs(data ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliges Laden der eigenen Dokumente, State folgt erst nach den Supabase-Antworten
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supabase) return null;

  function pick(key: string) {
    target.current = key;
    fileRef.current?.click();
  }

  async function upload(files: FileList | null) {
    const key = target.current;
    if (!files?.length || !supabase || !userId || !key) return;
    setBusy(key);
    setError(null);
    for (const file of Array.from(files)) {
      const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage.from("kunden-dokumente").upload(path, file);
      if (uploadError) {
        setError(`Upload fehlgeschlagen: ${uploadError.message}`);
        break;
      }
      await supabase.from("user_documents").insert({ user_id: userId, name: `${key} · ${file.name}`, storage_path: path });
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  const has = (key: string) => docs.some((d) => d.name.startsWith(`${key} · `));
  const done = items.filter((i) => has(i.key)).length;

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="font-display text-lg text-ivory">{title}</div>
        <div className="font-mono text-[11px] tracking-[0.1em] text-ivory-dim">
          {done} / {items.length} erledigt
        </div>
      </div>
      {intro && <p className="mt-1 text-sm text-ivory-dim">{intro}</p>}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-3">
        <div className="h-full rounded-full bg-amber transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
      </div>
      <ul className="mt-4 divide-y divide-line">
        {items.map((item) => {
          const ok = has(item.key);
          return (
            <li key={item.key} className="flex items-center gap-3 py-2.5">
              {ok ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" strokeWidth={1.75} />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-ivory-dim/50" strokeWidth={1.5} />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ivory">{item.label}</span>
                {item.hint && <span className="block text-xs text-ivory-dim">{item.hint}</span>}
              </span>
              <button
                type="button"
                disabled={!userId || busy !== null}
                onClick={() => pick(item.key)}
                className="flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ivory hover:border-amber disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
                {busy === item.key ? "Lädt…" : ok ? "Weitere" : "Hochladen"}
              </button>
            </li>
          );
        })}
      </ul>
      <input ref={fileRef} type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      <p className="mt-3 text-xs text-ivory-dim">Verschlüsselt gespeichert, nur Sie und Ihr NoviDom-Berater sehen die Dateien.</p>
    </div>
  );
}
