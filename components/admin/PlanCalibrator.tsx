"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

type Pt = { x: number; y: number }; // in Bildpixeln (natürliche Grösse)

/**
 * Massstab für den Grundriss-Planer setzen: zwei Punkte auf einer Strecke
 * mit bekannter Länge anklicken (z.B. eine bemasste Wand) und die Länge in
 * Metern eingeben. Zur Kontrolle wird ein Doppelbett 160 × 200 cm im
 * gleichen Massstab eingeblendet.
 */
export function PlanCalibrator({
  url,
  initialBreite,
  onSave,
  onCancel,
  onRemove,
}: {
  url: string;
  initialBreite?: number;
  onSave: (breiteM: number, ratio: number) => void;
  onCancel: () => void;
  /** Nur wenn dieses Bild schon der Grundriss ist */
  onRemove?: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [pts, setPts] = useState<Pt[]>([]);
  const [len, setLen] = useState("");
  const [breiteDirect, setBreiteDirect] = useState(initialBreite ? String(initialBreite) : "");

  // Bild kann schon geladen sein, bevor React onLoad anhängt (Cache)
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) {
      const id = requestAnimationFrame(() => setNatural({ w: img.naturalWidth, h: img.naturalHeight }));
      return () => cancelAnimationFrame(id);
    }
  }, [url]);

  function click(e: MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img || !natural) return;
    const rect = img.getBoundingClientRect();
    const p = { x: ((e.clientX - rect.left) / rect.width) * natural.w, y: ((e.clientY - rect.top) / rect.height) * natural.h };
    setPts((cur) => (cur.length >= 2 ? [p] : [...cur, p]));
  }

  const dist = pts.length === 2 ? Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) : 0;
  const meters = Number(len.replace(",", "."));
  const fromLine = natural && dist > 5 && meters > 0 ? (natural.w * meters) / dist : null;
  const direct = Number(breiteDirect.replace(",", "."));
  const breite = fromLine ?? (direct > 0 ? direct : null);
  const valid = breite !== null && breite >= 3 && breite <= 80;

  // Kontrolle: Doppelbett 160 × 200 cm in Bildpixeln
  const bed = natural && breite ? { w: (1.6 / breite) * natural.w, h: (2.0 / breite) * natural.w } : null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, maxWidth: 1000, width: "100%", maxHeight: "94vh", overflow: "auto", padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>Massstab für den Grundriss-Planer</div>
        <p style={{ fontSize: 13, color: "#555", marginTop: 4, lineHeight: 1.5 }}>
          1. Klicke auf den Anfang und das Ende einer Strecke, deren Länge du kennst (z.B. eine bemasste Wand oder Raumbreite). 2. Gib die Länge in
          Metern ein. Das eingeblendete Doppelbett (160 × 200 cm) muss dann realistisch gross wirken.
        </p>

        <div style={{ position: "relative", marginTop: 12, display: "inline-block", maxWidth: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Kalibrierung im CRM */}
          <img
            ref={imgRef}
            src={url}
            alt="Grundriss"
            onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            onClick={click}
            style={{ display: "block", maxWidth: "100%", maxHeight: "60vh", cursor: "crosshair", border: "1px solid #ddd", borderRadius: 8 }}
          />
          {natural &&
            pts.map((p, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: pct(p.x, natural.w),
                  top: pct(p.y, natural.h),
                  width: 12,
                  height: 12,
                  marginLeft: -6,
                  marginTop: -6,
                  borderRadius: 99,
                  background: "#c0392b",
                  border: "2px solid #fff",
                  pointerEvents: "none",
                }}
              />
            ))}
          {natural && pts.length === 2 && (
            <svg viewBox={`0 0 ${natural.w} ${natural.h}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y} stroke="#c0392b" strokeWidth={Math.max(2, natural.w / 400)} />
            </svg>
          )}
          {natural && bed && valid && (
            <span
              style={{
                position: "absolute",
                left: pct(natural.w / 2 - bed.w / 2, natural.w),
                top: pct(natural.h / 2 - bed.h / 2, natural.h),
                width: pct(bed.w, natural.w),
                height: pct(bed.h, natural.h),
                background: "rgba(143,106,57,.35)",
                border: "2px solid #8f6a39",
                borderRadius: 4,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#5a4220",
              }}
            >
              Bett
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", marginTop: 14 }}>
          <label style={{ fontSize: 13 }}>
            Länge der Strecke (m)
            <input
              value={len}
              onChange={(e) => setLen(e.target.value)}
              inputMode="decimal"
              placeholder={pts.length === 2 ? "z.B. 4.40" : "zuerst 2 Punkte klicken"}
              className="field-input"
              style={{ display: "block", width: 170, marginTop: 4 }}
              disabled={pts.length !== 2}
            />
          </label>
          <span style={{ fontSize: 12, color: "#777", paddingBottom: 10 }}>oder</span>
          <label style={{ fontSize: 13 }}>
            Gesamtbreite des Bildes (m)
            <input
              value={breiteDirect}
              onChange={(e) => {
                setBreiteDirect(e.target.value);
                setPts([]);
                setLen("");
              }}
              inputMode="decimal"
              placeholder="z.B. 11.6"
              className="field-input"
              style={{ display: "block", width: 170, marginTop: 4 }}
            />
          </label>
          <span style={{ fontSize: 13, paddingBottom: 10, color: valid ? "#2e7d4f" : "#999" }}>
            {breite ? `Bildbreite = ${breite.toFixed(2)} m` : ""}
            {breite && !valid ? " (unrealistisch)" : ""}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!valid || !natural}
            onClick={() => natural && breite && onSave(Math.round(breite * 100) / 100, Math.round((natural.w / natural.h) * 1000) / 1000)}
          >
            Massstab speichern
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            Abbrechen
          </button>
          {onRemove && (
            <button type="button" className="btn btn-danger btn-sm" style={{ marginLeft: "auto" }} onClick={onRemove}>
              Nicht mehr als Grundriss verwenden
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
