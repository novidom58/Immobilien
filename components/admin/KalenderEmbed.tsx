"use client";

import { useEffect, useState, type FormEvent } from "react";

const STORAGE_KEY = "novidom-admin-kalender-url";

export function KalenderEmbed() {
  const [url, setUrl] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? "";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only localStorage read, must run post-mount to stay hydration-safe
      setUrl(stored);
      setInput(stored);
    } catch {
      // localStorage blockiert (privates Fenster o.ä.) - Einbettung einfach leer lassen.
    }
  }, []);

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, input.trim());
    } catch {
      // localStorage blockiert - Einbettung funktioniert trotzdem für diese Sitzung.
    }
    setUrl(input.trim());
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <form onSubmit={handleSave} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap" }}>
        <div className="field-group" style={{ flex: 1, minWidth: 300, margin: 0 }}>
          <div className="field-label">Einbettungsadresse aus Google Kalender</div>
          <input
            className="field-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://calendar.google.com/calendar/embed?src=…"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Speichern
        </button>
      </form>

      {url ? (
        <iframe src={url} style={{ width: "100%", height: 600, border: "1px solid var(--border)", borderRadius: "var(--r)" }} title="Google Kalender" />
      ) : (
        <div className="empty">
          <div className="empty-icon">🗓️</div>
          <div className="empty-text">Noch keine Adresse hinterlegt</div>
        </div>
      )}

      <div className="td-light" style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.65 }}>
        So kommst du an die Adresse: Google Kalender öffnen → beim Kalender links auf die drei Punkte → <b>Einstellungen und Freigabe</b> → ganz
        unten <b>Kalender integrieren</b> → die Adresse aus <b>Einbettungscode</b> zwischen <code>src=&quot;…&quot;</code> herauskopieren. Die
        Adresse bleibt in diesem Browser gespeichert und wird nirgends hochgeladen.
      </div>
    </div>
  );
}
