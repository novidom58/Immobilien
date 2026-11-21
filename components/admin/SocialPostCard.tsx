"use client";

import { useState } from "react";
import { SOCIAL_VORLAGEN, socialCaption, type SocialListing, type SocialVorlage } from "@/lib/socialPost";

/**
 * Ein Inserat als Social-Media-Beitrag: Vorlage und Foto wählen, Bild
 * herunterladen, Text kopieren, in Instagram/Facebook einfügen. Fertig.
 */
export function SocialPostCard({ listing, photoCount, siteUrl }: { listing: SocialListing; photoCount: number; siteUrl: string }) {
  const defaultVorlage: SocialVorlage = listing.status === "active" ? "neu" : "status";
  const [vorlage, setVorlage] = useState<SocialVorlage>(defaultVorlage);
  const [foto, setFoto] = useState(0);
  const [copied, setCopied] = useState(false);

  const link = `${siteUrl}/immobilien/${listing.id}`;
  const caption = socialCaption(listing, vorlage, link);
  const src = `/api/social/${listing.id}?vorlage=${vorlage}&foto=${foto}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div id={`objekt-${listing.id}`} className="card" style={{ padding: 16, scrollMarginTop: 80, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", alignItems: "start" }}>
      <a href={src} target="_blank" rel="noreferrer" title="Gross ansehen">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={src}
          src={src}
          alt={`Vorschau ${listing.city}`}
          loading="lazy"
          style={{ width: "100%", aspectRatio: vorlage === "story" ? "9 / 16" : "4 / 5", objectFit: "cover", borderRadius: 10, background: "var(--bg)" }}
        />
      </a>
      <div style={{ display: "grid", gap: 10 }}>
        <div className="td-name">
          {listing.title || listing.property_type} · {listing.city}
        </div>
        <div className="flex flex-wrap gap-2">
          {SOCIAL_VORLAGEN.map((v) => (
            <button
              key={v.key}
              type="button"
              title={v.hinweis}
              className={`btn btn-sm ${vorlage === v.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setVorlage(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
        {photoCount > 1 && (
          <label className="field-label" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Foto
            <select className="field-select" style={{ width: "auto" }} value={foto} onChange={(e) => setFoto(Number(e.target.value))}>
              {Array.from({ length: photoCount }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? "Titelbild" : `Foto ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        )}
        <textarea className="field-input" readOnly value={caption} rows={9} style={{ fontSize: 12, lineHeight: 1.5 }} />
        <div className="flex flex-wrap gap-2">
          <a className="btn btn-primary btn-sm" href={`${src}&download=1`} download>
            ⬇ Bild herunterladen
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
            {copied ? "✓ Kopiert" : "📋 Text kopieren"}
          </button>
        </div>
      </div>
    </div>
  );
}
