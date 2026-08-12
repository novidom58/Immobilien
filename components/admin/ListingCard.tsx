"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, Trash2, MapPin, Pencil, UserPlus, UserX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  updateListingStatus,
  updateListing,
  assignListingOwner,
  unassignListingOwner,
  deleteListing,
} from "@/app/admin/actions";

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
  lat: number | null;
  photoCount: number;
  hasOwner: boolean;
};

const TYPE_OPTIONS = [
  { value: "Haus", label: "Einfamilienhaus" },
  { value: "Wohnung", label: "Wohnung" },
  { value: "Stockwerkeigentum", label: "Stockwerkeigentum" },
  { value: "Rendite", label: "Renditeliegenschaft" },
  { value: "Andere", label: "Andere" },
];

const editFieldClasses =
  "rounded-lg border border-line bg-ink px-3 py-2 text-sm text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none";

const STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf (nicht öffentlich)" },
  { value: "active", label: "Zum Verkauf" },
  { value: "reserved", label: "Reserviert" },
  { value: "sold", label: "Verkauft" },
];

export function ListingCard({ listing }: { listing: AdminListing }) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
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

    for (const file of Array.from(files)) {
      const path = `${listing.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
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
        sort_order: listing.photoCount,
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

  return (
    <div className="rounded-2xl border border-line bg-ink-2 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-semibold text-ivory">
            {listing.title || `${listing.address}, ${listing.city}`}
          </div>
          <div className="mt-1 text-sm text-ivory-dim">
            {listing.address}, {listing.city} · {listing.property_type}
            {listing.price_chf
              ? ` · CHF ${listing.price_chf.toLocaleString("en-US").replace(/,/g, "'")}`
              : ""}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" strokeWidth={1.5} />
              Karte: {listing.lat ? "Ja" : "Nein"}
            </span>
            <span>{listing.photoCount} Foto{listing.photoCount === 1 ? "" : "s"}</span>
            <Link href={`/immobilien/${listing.id}`} className="text-amber underline underline-offset-2">
              Detailseite ansehen
            </Link>
          </div>

          <div className="mt-3">
            {listing.hasOwner ? (
              <button
                type="button"
                disabled={busy === "unassign"}
                onClick={handleUnassign}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60 hover:text-red-400 disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" strokeWidth={1.5} />
                Kunde verknüpft — entfernen
              </button>
            ) : assigning ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="email"
                  autoFocus
                  placeholder="kunde@email.ch"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAssign()}
                  className="rounded-lg border border-line bg-ink px-2.5 py-1.5 text-xs text-ivory placeholder:text-ivory-dim/40 focus:border-amber focus:outline-none"
                />
                <button
                  type="button"
                  disabled={busy === "assign" || !assignEmail.trim()}
                  onClick={handleAssign}
                  className="font-mono text-[11px] uppercase tracking-wide text-amber hover:text-amber-soft disabled:opacity-50"
                >
                  {busy === "assign" ? "…" : "Bestätigen"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssigning(false);
                    setAssignEmail("");
                  }}
                  className="font-mono text-[11px] uppercase tracking-wide text-ivory-dim/40 hover:text-ivory-dim"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAssigning(true)}
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ivory-dim/60 hover:text-amber"
              >
                <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
                Kunde per E-Mail zuweisen
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={listing.status}
            disabled={busy === "status"}
            onChange={(e) => handleStatus(e.target.value)}
            className="rounded-xl border border-line bg-ink px-3 py-2 text-sm text-ivory focus:border-amber focus:outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={busy === "upload"}
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm text-ivory-dim hover:border-amber/50 hover:text-ivory disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
            {busy === "upload" ? "Lädt…" : "Fotos"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />

          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm text-ivory-dim hover:border-amber/50 hover:text-ivory"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.5} />
            {editing ? "Abbrechen" : "Bearbeiten"}
          </button>

          <button
            type="button"
            disabled={busy === "delete"}
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-xl border border-red-400/30 px-3 py-2 text-sm text-red-400/80 hover:border-red-400/60 hover:text-red-400 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            Löschen
          </button>
        </div>
      </div>

      {editing && (
        <form action={handleUpdate} className="mt-4 grid gap-2.5 border-t border-line pt-4 sm:grid-cols-2">
          <input
            name="title"
            defaultValue={listing.title ?? ""}
            placeholder="Titel"
            className={`${editFieldClasses} sm:col-span-2`}
          />
          <input name="address" required defaultValue={listing.address} placeholder="Adresse *" className={editFieldClasses} />
          <input name="city" required defaultValue={listing.city} placeholder="Ort *" className={editFieldClasses} />
          <input name="postal_code" defaultValue={listing.postal_code ?? ""} placeholder="PLZ" className={editFieldClasses} />
          <input
            name="price_chf"
            inputMode="numeric"
            defaultValue={listing.price_chf ?? ""}
            placeholder="Preis (CHF)"
            className={editFieldClasses}
          />
          <select name="property_type" defaultValue={listing.property_type} className={editFieldClasses}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              name="rooms"
              inputMode="decimal"
              defaultValue={listing.rooms ?? ""}
              placeholder="Zimmer"
              className={editFieldClasses}
            />
            <input
              name="living_area"
              inputMode="numeric"
              defaultValue={listing.living_area ?? ""}
              placeholder="Wohnfläche m²"
              className={editFieldClasses}
            />
          </div>
          <textarea
            name="description"
            rows={3}
            defaultValue={listing.description ?? ""}
            placeholder="Beschreibung"
            className={`${editFieldClasses} resize-none sm:col-span-2`}
          />
          <button
            type="submit"
            disabled={busy === "edit"}
            className="rounded-xl bg-amber px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-ink disabled:opacity-60 sm:col-span-2"
          >
            {busy === "edit" ? "Speichert…" : "Änderungen speichern"}
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
