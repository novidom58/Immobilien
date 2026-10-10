"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Trash2, MapPin, Pencil, UserPlus, UserX, FileText, FileUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  updateListingStatus,
  updateListing,
  assignListingOwner,
  unassignListingOwner,
  deleteListing,
} from "@/app/admin/actions";
import { PORTAL_OPTIONS } from "@/lib/constants";
import { SaleDeadlineBar } from "./SaleDeadlineBar";
import { clipFolder, flightFolder } from "@/lib/listingClips";
import { VideoFolderControl } from "./VideoFolderControl";

type AdminListing = {
  id: string;
  title: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  status: string;
  property_type: string;
  price_chf: number | null;
  rooms: number | null;
  living_area: number | null;
  description: string | null;
  tour_url: string | null;
  berater: string | null;
  activated_at: string | null;
  sale_deadline_months: number;
  posted_portals: string[];
  lat: number | null;
  photoCount: number;
  hasOwner: boolean;
  documents: { id: string; name: string; url: string }[];
};

const TYPE_OPTIONS = [
  { value: "Haus", label: "Einfamilienhaus" },
  { value: "Wohnung", label: "Wohnung" },
  { value: "Stockwerkeigentum", label: "Stockwerkeigentum" },
  { value: "Rendite", label: "Renditeliegenschaft" },
  { value: "Andere", label: "Andere" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf (nicht öffentlich)" },
  { value: "active", label: "Zum Verkauf" },
  { value: "reserved", label: "Reserviert" },
  { value: "sold", label: "Verkauft" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-muted",
  active: "badge-blue",
  reserved: "badge-gold",
  sold: "badge-green-solid",
};

export function ListingCard({
  listing,
  customerEmails = [],
  beraterOptions,
}: {
  listing: AdminListing;
  customerEmails?: string[];
  beraterOptions: string[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assigning, setAssigning] = useState(false);

  async function handleAssign() {
    if (!assignEmail.trim()) return;
    setBusy("assign");
    setError(null);
    const res = await assignListingOwner(listing.id, assignEmail.trim());
    setBusy(null);
    if (res.error) setError(res.error);
    else {
      setAssignEmail("");
      setAssigning(false);
      router.refresh();
    }
  }

  async function handleUnassign() {
    if (!window.confirm("Kundenverknüpfung wirklich entfernen?")) return;
    setBusy("unassign");
    setError(null);
    const res = await unassignListingOwner(listing.id);
    setBusy(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  async function handleUpdate(formData: FormData) {
    setBusy("edit");
    setError(null);
    const res = await updateListing(listing.id, formData);
    setBusy(null);
    if (res.error) setError(res.error);
    else {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleStatus(status: string) {
    setBusy("status");
    setError(null);
    const res = await updateListingStatus(listing.id, status);
    setBusy(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`Inserat "${listing.address}, ${listing.city}" wirklich löschen?`)) return;
    setBusy("delete");
    setError(null);
    const res = await deleteListing(listing.id);
    setBusy(null);
    if (res.error) setError(res.error);
    else router.refresh();
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !supabase) return;
    setBusy("upload");
    setError(null);

    // Nach Dateiname sortiert, damit "01-…", "02-…" die Reihenfolge im
    // Flythrough bestimmt; jedes Foto bekommt seine eigene Position.
    const sorted = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
    for (const [index, file] of sorted.entries()) {
      const path = `${listing.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { cacheControl: "3600" });
      if (uploadError) {
        setError(`Upload fehlgeschlagen: ${uploadError.message}`);
        setBusy(null);
        return;
      }
      const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
      const { error: insertError } = await supabase.from("listing_photos").insert({
        listing_id: listing.id,
        url: urlData.publicUrl,
        sort_order: listing.photoCount + index,
      });
      if (insertError) {
        setError(`Foto gespeichert, aber Verknüpfung fehlgeschlagen: ${insertError.message}`);
        setBusy(null);
        return;
      }
    }

    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function handleDocUpload(files: FileList | null) {
    if (!files || files.length === 0 || !supabase) return;
    setBusy("doc-upload");
    setError(null);

    for (const file of Array.from(files)) {
      const path = `${listing.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-dokumente")
        .upload(path, file);
      if (uploadError) {
        setError(`Upload fehlgeschlagen: ${uploadError.message}`);
        setBusy(null);
        return;
      }
      const { error: insertError } = await supabase.from("listing_documents").insert({
        listing_id: listing.id,
        name: file.name,
        url: path,
      });
      if (insertError) {
        setError(`Datei gespeichert, aber Verknüpfung fehlgeschlagen: ${insertError.message}`);
        setBusy(null);
        return;
      }
    }

    setBusy(null);
    if (docFileRef.current) docFileRef.current.value = "";
    router.refresh();
  }

  async function handleDocDelete(doc: { id: string; url: string }) {
    if (!supabase) return;
    if (!window.confirm("Dokument wirklich löschen?")) return;
    setBusy(`doc-delete-${doc.id}`);
    setError(null);
    if (!doc.url.startsWith("http")) {
      await supabase.storage.from("listing-dokumente").remove([doc.url]);
    }
    const { error: deleteError } = await supabase.from("listing_documents").delete().eq("id", doc.id);
    setBusy(null);
    if (deleteError) setError(`Löschen fehlgeschlagen: ${deleteError.message}`);
    else router.refresh();
  }

  return (
    <div className="card" id={listing.id}>
      <div className="card-header" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="card-title">{listing.title || `${listing.address}, ${listing.city}`}</div>
          <div className="card-sub">
            {listing.address}, {listing.city} · {listing.property_type}
            {listing.price_chf ? ` · CHF ${listing.price_chf.toLocaleString("en-US").replace(/,/g, "'")}` : ""}
          </div>
          <span className={`badge ${STATUS_BADGE[listing.status] ?? "badge-muted"}`} style={{ marginTop: 8, display: "inline-flex" }}>
            {STATUS_OPTIONS.find((o) => o.value === listing.status)?.label ?? listing.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={listing.status} disabled={busy === "status"} onChange={(e) => handleStatus(e.target.value)} className="filter-select">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button type="button" disabled={busy === "upload"} onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm">
            <ImagePlus className="h-3.5 w-3.5" strokeWidth={1.75} />
            {busy === "upload" ? "Lädt…" : "Fotos"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />

          <button type="button" disabled={busy === "doc-upload"} onClick={() => docFileRef.current?.click()} className="btn btn-ghost btn-sm">
            <FileUp className="h-3.5 w-3.5" strokeWidth={1.75} />
            {busy === "doc-upload" ? "Lädt…" : "Dokumente"}
          </button>
          <input ref={docFileRef} type="file" multiple className="hidden" onChange={(e) => handleDocUpload(e.target.files)} />

          <button type="button" onClick={() => setEditing((v) => !v)} className="btn btn-ghost btn-sm">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            {editing ? "Abbrechen" : "Bearbeiten"}
          </button>

          <button type="button" disabled={busy === "delete"} onClick={handleDelete} className="btn btn-danger btn-sm">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Löschen
          </button>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div className="flex flex-wrap gap-3" style={{ fontSize: 11 }}>
          <span className="flex items-center gap-1 td-light">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            Karte: {listing.lat ? "Ja" : "Nein"}
          </span>
          <span className="td-light">
            {listing.photoCount} Foto{listing.photoCount === 1 ? "" : "s"}
          </span>
          <VideoFolderControl folder={clipFolder(listing.id)} label="Clips pro Foto" onError={setError} />
          <VideoFolderControl folder={flightFolder(listing.id)} label="Drohnenflug" onError={setError} />
          {listing.berater && <span className="bchip">{listing.berater}</span>}
          <span className="td-light">
            Portale: {listing.posted_portals.length > 0 ? listing.posted_portals.join(", ") : "keine"}
          </span>
          <Link href={`/immobilien/${listing.id}`} style={{ color: "var(--blue)", textDecoration: "underline" }}>
            Detailseite ansehen
          </Link>
          <Link href={`/immobilien/${listing.id}/expose`} target="_blank" style={{ color: "var(--blue)", textDecoration: "underline" }}>
            Exposé ansehen
          </Link>
        </div>

        {(listing.status === "active" || listing.status === "reserved") && (
          <div className="mt-3" style={{ maxWidth: 320 }}>
            <SaleDeadlineBar activatedAt={listing.activated_at} deadlineMonths={listing.sale_deadline_months} />
          </div>
        )}

        <div className="mt-3">
          {listing.hasOwner ? (
            <button type="button" disabled={busy === "unassign"} onClick={handleUnassign} className="btn btn-ghost btn-sm">
              <UserX className="h-3.5 w-3.5" strokeWidth={1.75} />
              Kunde verknüpft — entfernen
            </button>
          ) : assigning ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="email"
                autoFocus
                list={`customers-${listing.id}`}
                placeholder="kunde@email.ch"
                value={assignEmail}
                onChange={(e) => setAssignEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAssign()}
                className="search-input"
              />
              <datalist id={`customers-${listing.id}`}>
                {customerEmails.map((email) => (
                  <option key={email} value={email} />
                ))}
              </datalist>
              <button type="button" disabled={busy === "assign" || !assignEmail.trim()} onClick={handleAssign} className="btn btn-primary btn-sm">
                {busy === "assign" ? "…" : "Bestätigen"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssigning(false);
                  setAssignEmail("");
                }}
                className="btn btn-ghost btn-sm"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setAssigning(true)} className="btn btn-ghost btn-sm">
              <UserPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Kunde per E-Mail zuweisen
            </button>
          )}
        </div>

        {listing.documents.length > 0 && (
          <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div className="detail-label flex items-center gap-1.5" style={{ marginBottom: 8 }}>
              <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
              Verkaufsdossier &amp; Dokumente
            </div>
            <div className="flex flex-col gap-1.5">
              {listing.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-2" style={{ fontSize: 13 }}>
                  <span className="truncate td-light">{doc.name}</span>
                  <button
                    type="button"
                    disabled={busy === `doc-delete-${doc.id}`}
                    onClick={() => handleDocDelete(doc)}
                    aria-label="Dokument löschen"
                    style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer" }}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {editing && (
          <form action={handleUpdate} className="mt-4 grid gap-2.5 sm:grid-cols-2" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <input name="title" defaultValue={listing.title ?? ""} placeholder="Titel" className="field-input sm:col-span-2" />
            <input name="address" required defaultValue={listing.address} placeholder="Adresse *" className="field-input" />
            <input name="city" required defaultValue={listing.city} placeholder="Ort *" className="field-input" />
            <input name="postal_code" defaultValue={listing.postal_code ?? ""} placeholder="PLZ" className="field-input" />
            <input name="price_chf" inputMode="numeric" defaultValue={listing.price_chf ?? ""} placeholder="Preis (CHF)" className="field-input" />
            <select name="property_type" defaultValue={listing.property_type} className="field-select">
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select name="berater" defaultValue={listing.berater ?? ""} className="field-select">
              <option value="">Berater zuweisen</option>
              {beraterOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2.5">
              <input name="rooms" inputMode="decimal" defaultValue={listing.rooms ?? ""} placeholder="Zimmer" className="field-input" />
              <input name="living_area" inputMode="numeric" defaultValue={listing.living_area ?? ""} placeholder="Wohnfläche m²" className="field-input" />
            </div>
            <textarea
              name="description"
              rows={3}
              defaultValue={listing.description ?? ""}
              placeholder="Beschreibung"
              className="field-textarea sm:col-span-2"
            />
            <input
              name="tour_url"
              type="url"
              defaultValue={listing.tour_url ?? ""}
              placeholder="360°-Rundgang-Link (z.B. von Giraffe360)"
              className="field-input sm:col-span-2"
            />
            <div className="sm:col-span-2">
              <div className="field-label" style={{ marginBottom: 6 }}>
                Auf Portalen aufgeschaltet
              </div>
              <div className="flex flex-wrap gap-3">
                {PORTAL_OPTIONS.map((p) => (
                  <label key={p} className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
                    <input
                      type="checkbox"
                      name="posted_portals"
                      value={p}
                      defaultChecked={listing.posted_portals.includes(p)}
                      style={{ accentColor: "var(--blue)" }}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={busy === "edit"} className="btn btn-primary sm:col-span-2">
              {busy === "edit" ? "Speichert…" : "Änderungen speichern"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-3" style={{ fontSize: 13, color: "var(--red)" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
