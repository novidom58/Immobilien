"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CalendarEvent } from "@/lib/ics";

const STORAGE_KEY = "novidom-admin-kalender-url";

function isIcs(url: string) {
  return /\.ics(\?|$)/i.test(url) || /^webcals?:/i.test(url);
}

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("de-CH", { timeZone: "Europe/Zurich", weekday: "long", day: "numeric", month: "long" });
}

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("de-CH", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" });
}

/** Termine aus einem veröffentlichten Outlook- oder Google-Kalender (ICS-Link). */
function IcsAgenda({ url }: { url: string }) {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/calendar?url=${encodeURIComponent(url)}`)
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setError(data.error ?? "Kalender konnte nicht geladen werden.");
        else setEvents(data.events);
      })
      .catch(() => !cancelled && setError("Kalender konnte nicht geladen werden."));
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) return <p style={{ fontSize: 13, color: "var(--red)" }}>{error}</p>;
  if (!events) return <p className="td-light" style={{ fontSize: 13 }}>Kalender lädt …</p>;
  if (events.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">🗓️</div>
        <div className="empty-text">Keine Termine in den nächsten 60 Tagen</div>
      </div>
    );
  }

  const groups = new Map<string, CalendarEvent[]>();
  for (const e of events) groups.set(dayKey(e.start), [...(groups.get(dayKey(e.start)) ?? []), e]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {[...groups.entries()].map(([day, list]) => (
        <div key={day}>
          <div className="detail-label" style={{ marginBottom: 6 }}>
            {day}
          </div>
          {list.map((e, i) => (
            <div key={`${e.start}-${i}`} className="tl-entry">
              <div className="tl-icon tl-blue" style={{ width: 64, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                {e.allDay ? "ganztags" : time(e.start)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tl-title">{e.title}</div>
                <div className="tl-meta">
                  {!e.allDay && e.end ? `bis ${time(e.end)}` : ""}
                  {e.location ? `${!e.allDay && e.end ? " · " : ""}${e.location}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

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
      // localStorage blockiert (privates Fenster o.ä.) - Anzeige einfach leer lassen.
    }
  }, []);

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, input.trim());
    } catch {
      // localStorage blockiert - Anzeige funktioniert trotzdem für diese Sitzung.
    }
    setUrl(input.trim());
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <form onSubmit={handleSave} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap" }}>
        <div className="field-group" style={{ flex: 1, minWidth: 300, margin: 0 }}>
          <div className="field-label">Kalender-Link (Outlook ICS oder Google)</div>
          <input
            className="field-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://outlook.live.com/owa/calendar/…/calendar.ics"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Speichern
        </button>
      </form>

      {!url ? (
        <div className="empty">
          <div className="empty-icon">🗓️</div>
          <div className="empty-text">Noch kein Kalender hinterlegt</div>
        </div>
      ) : isIcs(url) ? (
        <IcsAgenda url={url} />
      ) : (
        <iframe src={url} style={{ width: "100%", height: 600, border: "1px solid var(--border)", borderRadius: "var(--r)" }} title="Kalender" />
      )}

      <div className="td-light" style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.65 }}>
        <b>Outlook:</b> outlook.com im Browser → Einstellungen (Zahnrad) → <b>Kalender</b> → <b>Freigegebene Kalender</b> →{" "}
        <b>Kalender veröffentlichen</b>: Kalender und «Kann alle Details anzeigen» wählen → <b>Veröffentlichen</b> → den{" "}
        <b>ICS</b>-Link (endet auf <code>.ics</code>) kopieren und hier ganz einfügen. Termine erscheinen mit etwas Verzögerung, so wie
        Outlook den veröffentlichten Kalender aktualisiert.
        <br />
        <b>Google:</b> Kalender-Einstellungen → <b>Kalender integrieren</b> → «Privatadresse im iCal-Format» kopieren.
        <br />
        Der Link bleibt nur in diesem Browser gespeichert. Wer ihn kennt, kann den Kalender lesen: nicht weitergeben.
      </div>
    </div>
  );
}
