"use client";

import { useEffect, useRef, useState } from "react";
import { Clapperboard, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CLIP_BUCKET, isClipFile } from "@/lib/listingClips";

/**
 * Videos eines Inserats in einem Storage-Ordner (Flythrough-Clips oder
 * Drohnenflug): Anzahl anzeigen, hochladen, alle löschen. Dateien werden
 * durchnummeriert, mehrere auf einmal nach Dateiname sortiert.
 */
export function VideoFolderControl({
  folder,
  label,
  onError,
}: {
  folder: string;
  label: string;
  onError: (message: string | null) => void;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [names, setNames] = useState<string[]>([]);
  const [busy, setBusy] = useState<"upload" | "delete" | null>(null);

  async function load() {
    if (!supabase) return [];
    const { data } = await supabase.storage.from(CLIP_BUCKET).list(folder, { sortBy: { column: "name", order: "asc" } });
    const list = (data ?? []).map((f) => f.name).filter(isClipFile);
    setNames(list);
    return list;
  }

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.storage
      .from(CLIP_BUCKET)
      .list(folder, { sortBy: { column: "name", order: "asc" } })
      .then(({ data }) => {
        if (!cancelled) setNames((data ?? []).map((f) => f.name).filter(isClipFile));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase-Client ist pro Render neu, einmal pro Ordner laden
  }, [folder]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !supabase) return;
    setBusy("upload");
    onError(null);
    const existing = await load();
    const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
    for (const [index, file] of sorted.entries()) {
      const num = String(existing.length + index + 1).padStart(2, "0");
      // Eine vorhandene Nummer im Namen nicht doppeln ("01-kueche" -> "01-kueche", nicht "01-01-kueche").
      const base = file.name.replace(/^\d+[-_ ]*/, "").replace(/[^a-zA-Z0-9._-]/g, "_");
      const { error } = await supabase.storage
        .from(CLIP_BUCKET)
        .upload(`${folder}/${num}-${base}`, file, { cacheControl: "3600", contentType: file.type || "video/mp4" });
      if (error) {
        onError(`${label}: Upload fehlgeschlagen (${error.message})`);
        break;
      }
    }
    await load();
    setBusy(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete() {
    if (!supabase || names.length === 0) return;
    if (!window.confirm(`Alle ${names.length} Videos «${label}» löschen?`)) return;
    setBusy("delete");
    onError(null);
    const { error } = await supabase.storage.from(CLIP_BUCKET).remove(names.map((n) => `${folder}/${n}`));
    if (error) onError(`${label}: Löschen fehlgeschlagen (${error.message})`);
    await load();
    setBusy(null);
  }

  return (
    <span className="flex items-center gap-1.5 td-light">
      {label}: {names.length}
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => inputRef.current?.click()}
        title={`${label} hochladen`}
        style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}
      >
        <Clapperboard className="h-3 w-3" strokeWidth={1.75} />
        {busy === "upload" ? "lädt…" : "hochladen"}
      </button>
      {names.length > 0 && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={handleDelete}
          aria-label={`Alle ${label} löschen`}
          style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer" }}
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.75} />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
    </span>
  );
}
