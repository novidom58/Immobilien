"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Images, Ruler, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PlanCalibrator } from "@/components/admin/PlanCalibrator";

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
  const [calibrating, setCalibrating] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grundriss, setGrundriss] = useState<{ url: string; breite_m: number; ratio: number } | null>(null);

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
    const { data: row } = await supabase.from("listings").select("*").eq("id", listingId).maybeSingle();
    const g = (row?.details as { grundriss?: { url: string; breite_m: number; ratio: number } } | null)?.grundriss;
    setGrundriss(g ?? null);
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

  /** Foto als Grundriss für den Planer im Kundenportal setzen (mit Breite in Metern). */
  function setAsPlan(photo: Photo) {
    if (!supabase) return;
    setCalibrating(photo.url);
  }

  async function saveDetails(next: { url: string; breite_m: number; ratio: number } | null) {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { data: row, error: readError } = await supabase.from("listings").select("*").eq("id", listingId).maybeSingle();
    if (readError || !row) {
      setBusy(false);
      setError("Inserat konnte nicht gelesen werden.");
      return;
    }
    const details = { ...((row.details as Record<string, unknown> | null) ?? {}) };
    if (next) details.grundriss = next;
    else delete details.grundriss;
    const { error: saveError } = await supabase.from("listings").update({ details }).eq("id", listingId);
    setBusy(false);
    if (saveError) {
      setError(
        saveError.message.includes("details")
          ? "Bitte zuerst in Supabase das SQL «Objekt-Eckdaten» ausführen."
          : `Grundriss nicht gespeichert: ${saveError.message}`
      );
      return;
    }
    setGrundriss(next);
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

  async function removeAll() {
    if (!supabase || !photos?.length) return;
    if (!window.confirm(`Alle ${photos.length} Fotos dieses Inserats löschen? Das lässt sich nicht rückgängig machen.`)) return;
    setBusy(true);
    setError(null);
    const { error: deleteError } = await supabase
      .from("listing_photos")
      .delete()
      .in(
        "id",
        photos.map((p) => p.id)
      );
    if (deleteError) {
      setBusy(false);
      setError(`Löschen fehlgeschlagen: ${deleteError.message}`);
      return;
    }
    const paths = photos.map((p) => decodeURIComponent(p.url.split("/listing-photos/")[1] ?? "")).filter(Boolean);
    if (paths.length) await supabase.storage.from("listing-photos").remove(paths);
    if (grundriss && photos.some((p) => p.url === grundriss.url)) await saveDetails(null);
    setBusy(false);
    await saveOrder([]);
  }

  if (!supabase) return null;

  return (
    <div style={{ width: "100%" }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen((v) => !v)}>
        <Images className="h-3.5 w-3.5" strokeWidth={1.75} />
        {open ? "Fotos schliessen" : `Fotos & Titelbild (${count})`}
      </button>

      {calibrating && (
        <PlanCalibrator
          url={calibrating}
          initialBreite={grundriss?.url === calibrating ? grundriss.breite_m : undefined}
          onCancel={() => setCalibrating(null)}
          onRemove={
            grundriss?.url === calibrating
              ? async () => {
                  setCalibrating(null);
                  await saveDetails(null);
                }
              : undefined
          }
          onSave={async (breite, ratio) => {
            const url = calibrating;
            setCalibrating(null);
            await saveDetails({ url, breite_m: breite, ratio });
          }}
        />
      )}
      {open && (
        <div style={{ marginTop: 12 }}>
          <p className="td-light" style={{ fontSize: 12, marginBottom: 10 }}>
            Das erste Foto ist das <b>Titelbild</b>: auf der Objektseite, der Startseite, im Exposé und im Flyer. Mit dem Stern
            machst du ein Foto zum Titelbild, mit den Pfeilen änderst du die Reihenfolge. Mit dem <b>Massstab</b> markierst du den
            Grundriss: Kunden können ihn dann im Kundenportal massstabsgetreu einrichten (dafür die Breite in Metern angeben).
          </p>
          {error && <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 8 }}>{error}</p>}
          {photos && photos.length > 1 && (
            <button type="button" className="btn btn-danger btn-sm" style={{ marginBottom: 10 }} disabled={busy} onClick={removeAll}>
              Alle {photos.length} Fotos löschen
            </button>
          )}
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
                    {grundriss?.url === p.url && (
                      <span style={{ position: "absolute", right: 6, top: 6, fontSize: 10.5, padding: "2px 7px", borderRadius: 99, background: "#3b5b8c", color: "#fff" }}>
                        Grundriss {grundriss.breite_m} m
                      </span>
                    )}
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
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setAsPlan(p)}
                      title="Als Grundriss für den Planer im Kundenportal"
                      aria-label="Als Grundriss für den Planer"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "3px 6px", color: grundriss?.url === p.url ? "#3b5b8c" : undefined }}
                    >
                      <Ruler className="h-3.5 w-3.5" strokeWidth={1.75} />
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
