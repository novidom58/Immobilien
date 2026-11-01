"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Images, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Photo = { id: string; url: string; sort_order: number };

/**
 * Fotos eines Inserats verwalten: Titelbild bestimmen (erstes Foto =
 * Titelbild auf Webseite, Startseite, Exposé und Flyer), Reihenfolge
 * ändern und Fotos löschen.
 */
export function PhotoManager({ listingId, count }: { listingId: string; count: number }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: loadError } = await supabase
      .from("listing_photos")
      .select("id, url, sort_order")
      .eq("listing_id", listingId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (loadError) setError(loadError.message);
    setPhotos((data ?? []) as Photo[]);
    // supabase ist pro Render neu, die Liste soll nur bei Inserat-Wechsel neu laden
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lädt die Fotos erst beim Aufklappen
    if (open) load();
  }, [open, load, count]);

  async function saveOrder(next: Photo[]) {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setPhotos(next);
    const results = await Promise.all(
      next.map((p, i) => (p.sort_order === i ? null : supabase.from("listing_photos").update({ sort_order: i }).eq("id", p.id)))
    );
    const failed = results.find((r) => r?.error);
    setBusy(false);
    if (failed?.error) setError(`Reihenfolge nicht gespeichert: ${failed.error.message}`);
    setPhotos(next.map((p, i) => ({ ...p, sort_order: i })));
    router.refresh();
  }

  function move(index: number, delta: number) {
    if (!photos) return;
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    saveOrder(next);
  }

  function makeCover(index: number) {
    if (!photos || index === 0) return;
    const next = [photos[index], ...photos.filter((_, i) => i !== index)];
    saveOrder(next);
  }

  async function remove(photo: Photo) {
    if (!supabase || !window.confirm("Dieses Foto wirklich löschen?")) return;
    setBusy(true);
    setError(null);
    const { error: deleteError } = await supabase.from("listing_photos").delete().eq("id", photo.id);
    if (deleteError) {
      setBusy(false);
      setError(`Löschen fehlgeschlagen: ${deleteError.message}`);
      return;
    }
    // Datei im Speicher ebenfalls entfernen (best effort)
    const path = decodeURIComponent(photo.url.split("/listing-photos/")[1] ?? "");
    if (path) await supabase.storage.from("listing-photos").remove([path]);
    const rest = (photos ?? []).filter((p) => p.id !== photo.id);
    setBusy(false);
    await saveOrder(rest);
  }

  if (!supabase) return null;

  return (
    <div style={{ width: "100%" }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)}>
        <Images className="h-3.5 w-3.5" strokeWidth={1.75} />
        {open ? "Fotos schliessen" : `Fotos & Titelbild (${count})`}
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <p className="td-light" style={{ fontSize: 12, marginBottom: 10 }}>
            Das erste Foto ist das <b>Titelbild</b>: auf der Objektseite, der Startseite, im Exposé und im Flyer. Mit dem Stern
            machst du ein Foto zum Titelbild, mit den Pfeilen änderst du die Reihenfolge. Im Exposé folgen danach die Bilder in
            dieser Reihenfolge.
          </p>
          {error && <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 8 }}>{error}</p>}
          {!photos ? (
            <p className="td-light" style={{ fontSize: 12 }}>Fotos werden geladen …</p>
          ) : photos.length === 0 ? (
            <p className="td-light" style={{ fontSize: 12 }}>Noch keine Fotos. Oben mit «Fotos» hochladen.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, opacity: busy ? 0.6 : 1 }}>
              {photos.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    border: i === 0 ? "2px solid #8f6a39" : "1px solid var(--border)",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "4 / 3", background: "#eee" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- kleine Vorschau im CRM */}
                    <img src={p.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span
                      style={{
                        position: "absolute",
                        left: 6,
                        top: 6,
                        fontSize: 10.5,
                        padding: "2px 7px",
                        borderRadius: 99,
                        background: i === 0 ? "#8f6a39" : "rgba(0,0,0,0.55)",
                        color: "#fff",
                      }}
                    >
                      {i === 0 ? "Titelbild" : i + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between" style={{ padding: "5px 6px" }}>
                    <button
                      type="button"
                      disabled={busy || i === 0}
                      onClick={() => makeCover(i)}
                      title="Als Titelbild verwenden"
                      aria-label="Als Titelbild verwenden"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "3px 6px" }}
                    >
                      <Star className="h-3.5 w-3.5" strokeWidth={1.75} fill={i === 0 ? "#8f6a39" : "none"} color="#8f6a39" />
                    </button>
                    <span className="flex">
                      <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label="Nach vorne" className="btn btn-ghost btn-sm" style={{ padding: "3px 5px" }}>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === photos.length - 1}
                        onClick={() => move(i, 1)}
                        aria-label="Nach hinten"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "3px 5px" }}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </span>
                    <button type="button" disabled={busy} onClick={() => remove(p)} aria-label="Foto löschen" className="btn btn-ghost btn-sm" style={{ padding: "3px 6px", color: "var(--red)" }}>
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
