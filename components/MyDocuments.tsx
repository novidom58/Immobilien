"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Trash2, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Doc = { id: string; name: string; storage_path: string };

export function MyDocuments() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);
    const { data } = await supabase
      .from("user_documents")
      .select("id, name, storage_path")
      .order("created_at", { ascending: false });
    setDocs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time fetch of the signed-in user's own documents on mount; state updates happen after the async Supabase calls resolve, not synchronously
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supabase) return null;

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !supabase || !userId) return;
    setBusy("upload");
    setError(null);

    for (const file of Array.from(files)) {
      const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("kunden-dokumente")
        .upload(path, file);
      if (uploadError) {
        setError(`Upload fehlgeschlagen: ${uploadError.message}`);
        setBusy(null);
        return;
      }
      const { error: insertError } = await supabase
        .from("user_documents")
        .insert({ user_id: userId, name: file.name, storage_path: path });
      if (insertError) {
        setError(`Datei gespeichert, aber Eintrag fehlgeschlagen: ${insertError.message}`);
        setBusy(null);
        return;
      }
    }

    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function handleDownload(doc: Doc) {
    if (!supabase) return;
    const { data, error: signError } = await supabase.storage
      .from("kunden-dokumente")
      .createSignedUrl(doc.storage_path, 60);
    if (signError || !data) {
      setError(`Download fehlgeschlagen: ${signError?.message}`);
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(doc: Doc) {
    if (!supabase) return;
    setBusy(doc.id);
    await supabase.storage.from("kunden-dokumente").remove([doc.storage_path]);
    await supabase.from("user_documents").delete().eq("id", doc.id);
    setBusy(null);
    load();
  }

  return (
    <div className="rounded-xl bg-ink p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
          <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
          Ihre Unterlagen
        </div>
        <button
          type="button"
          disabled={busy === "upload" || !userId}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-amber hover:text-amber-soft disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
          {busy === "upload" ? "Lädt…" : "Hochladen"}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {loading ? (
        <p className="text-xs text-ivory-dim/60">Wird geladen…</p>
      ) : docs.length === 0 ? (
        <p className="text-xs text-ivory-dim/60">
          Noch keine eigenen Unterlagen hochgeladen (z. B. Grundbuchauszug, Ausweiskopie).
        </p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-2 text-xs text-ivory-dim">
              <span className="flex items-center gap-2 truncate">
                <span className="h-1 w-1 shrink-0 rounded-full bg-amber/70" />
                <span className="truncate">{doc.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="text-ivory-dim hover:text-amber-soft"
                  aria-label="Herunterladen"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  disabled={busy === doc.id}
                  onClick={() => handleDelete(doc)}
                  className="text-ivory-dim hover:text-red-400 disabled:opacity-50"
                  aria-label="Löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
