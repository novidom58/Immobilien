"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "@/lib/ics";

export type CrmTermin = { id: string; title: string; typeLabel: string; starts_at: string; customerName: string | null };

type Item = { key: string; title: string; start: Date; end: Date | null; allDay: boolean; location: string | null; crm: boolean };

const ZONE = "Europe/Zurich";
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const dayKey = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: ZONE }); // JJJJ-MM-TT in Zürcher Zeit
const time = (d: Date) => d.toLocaleTimeString("de-CH", { timeZone: ZONE, hour: "2-digit", minute: "2-digit" });

function startOfWeek(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Kalender mit Monats- und Wochenansicht: Firmenkalender (Hostpoint/Cal.com)
 * und die im CRM erfassten Termine zusammen.
 */
export function CalendarView({ termine, shared }: { termine: CrmTermin[]; shared: boolean }) {
  const [view, setView] = useState<"monat" | "woche">("monat");
  const [anchor, setAnchor] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // Sichtbare Tage: ganze Wochen vom Monatsanfang bis Monatsende oder eine Woche
  const days = useMemo(() => {
    const first = view === "monat" ? startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth(), 1)) : startOfWeek(anchor);
    const count = view === "monat" ? 42 : 7;
    return Array.from({ length: count }, (_, i) => addDays(first, i));
  }, [anchor, view]);

  const rangeFrom = days[0];
  const rangeTo = addDays(days[days.length - 1], 1);

  useEffect(() => {
    if (!shared) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Ladeanzeige beim Wechsel des Zeitraums
    setState("loading");
    fetch(`/api/admin/calendar?shared=1&from=${rangeFrom.toISOString()}&to=${rangeTo.toISOString()}`)
      .then(async (res) => {
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setError(data.error ?? "Kalender konnte nicht geladen werden.");
          setState("error");
        } else {
          setEvents(data.events);
          setState("idle");
        }
      })
      .catch(() => {
        if (active) {
          setError("Kalender konnte nicht geladen werden.");
          setState("error");
        }
      });
    return () => {
      active = false;
    };
    // rangeFrom/rangeTo ergeben sich aus days
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shared, days]);

  const byDay = useMemo(() => {
    const items: Item[] = [
      ...events.map((e, i) => ({
        key: `c${i}`,
        title: e.title,
        start: new Date(e.start),
        end: e.end ? new Date(e.end) : null,
        allDay: e.allDay,
        location: e.location,
        crm: false,
      })),
      ...termine.map((t) => ({
        key: `t${t.id}`,
        title: `${t.typeLabel}${t.customerName ? `: ${t.customerName}` : ""}${t.title && t.title !== t.typeLabel ? ` (${t.title})` : ""}`,
        start: new Date(t.starts_at),
        end: null,
        allDay: false,
        location: null,
        crm: true,
      })),
    ].sort((a, b) => a.start.getTime() - b.start.getTime());
    const map = new Map<string, Item[]>();
    for (const it of items) map.set(dayKey(it.start), [...(map.get(dayKey(it.start)) ?? []), it]);
    return map;
  }, [events, termine]);

  const today = dayKey(new Date());
  const title =
    view === "monat"
      ? anchor.toLocaleDateString("de-CH", { month: "long", year: "numeric" })
      : `${days[0].toLocaleDateString("de-CH", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("de-CH", { day: "numeric", month: "short", year: "numeric" })}`;

  function move(step: number) {
    setSelected(null);
    setAnchor((a) => (view === "monat" ? new Date(a.getFullYear(), a.getMonth() + step, 1) : addDays(a, 7 * step)));
  }

  const selectedItems = selected ? byDay.get(selected) ?? [] : [];

  const chip = (it: Item, big = false) => (
    <div
      key={it.key}
      title={`${it.allDay ? "ganztags" : time(it.start)} ${it.title}${it.location ? ` · ${it.location}` : ""}`}
      style={{
        fontSize: big ? 12.5 : 11,
        lineHeight: 1.3,
        padding: big ? "6px 8px" : "2px 6px",
        borderRadius: 6,
        marginTop: 3,
        background: it.crm ? "rgba(143,106,57,0.14)" : "rgba(59,91,140,0.12)",
        borderLeft: `3px solid ${it.crm ? "#8f6a39" : "#3b5b8c"}`,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: big ? "normal" : "nowrap",
      }}
    >
      <b style={{ fontVariantNumeric: "tabular-nums" }}>{it.allDay ? "Ganztags" : time(it.start)}</b> {it.title}
      {big && it.end && !it.allDay && <span className="td-light"> bis {time(it.end)}</span>}
      {big && it.location && <div className="td-light">{it.location}</div>}
    </div>
  );

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-sm" onClick={() => move(-1)} aria-label="Zurück">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className="btn btn-sm" onClick={() => { setAnchor(new Date()); setSelected(null); }}>
            Heute
          </button>
          <button type="button" className="btn btn-sm" onClick={() => move(1)} aria-label="Weiter">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span style={{ fontWeight: 600, fontSize: 16, marginLeft: 6, textTransform: "capitalize" }}>{title}</span>
          {state === "loading" && <span className="td-light" style={{ fontSize: 12 }}>lädt …</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="td-light flex items-center gap-3" style={{ fontSize: 11.5 }}>
            <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "#3b5b8c", marginRight: 4 }} />Firmenkalender</span>
            <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "#8f6a39", marginRight: 4 }} />CRM-Termine</span>
          </span>
          <div className="flex overflow-hidden rounded-full border" style={{ borderColor: "var(--border)" }}>
            {(["monat", "woche"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                style={{ padding: "5px 12px", fontSize: 12, background: view === v ? "#191b1d" : "transparent", color: view === v ? "#fff" : "inherit" }}
              >
                {v === "monat" ? "Monat" : "Woche"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state === "error" && <p style={{ fontSize: 12.5, color: "var(--red)", marginBottom: 8 }}>{error}</p>}
      {!shared && (
        <p className="td-light" style={{ fontSize: 12.5, marginBottom: 8 }}>
          Firmenkalender noch nicht verbunden: in Vercel KALENDER_CALDAV_URL, _USER und _PASSWORD setzen. Bis dahin erscheinen hier die CRM-Termine.
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="td-light" style={{ fontSize: 11, padding: "6px 8px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }}>
            {w}
          </div>
        ))}
        {days.map((d, i) => {
          const key = dayKey(d);
          const items = byDay.get(key) ?? [];
          const outside = view === "monat" && d.getMonth() !== anchor.getMonth();
          const max = view === "monat" ? 3 : 12;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(selected === key ? null : key)}
              style={{
                textAlign: "left",
                minHeight: view === "monat" ? 96 : 320,
                padding: 6,
                borderRight: (i + 1) % 7 ? "1px solid var(--border)" : "none",
                borderBottom: "1px solid var(--border)",
                background: selected === key ? "rgba(143,106,57,0.08)" : outside ? "rgba(0,0,0,0.025)" : "transparent",
                opacity: outside ? 0.55 : 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: key === today ? 700 : 500,
                  display: "inline-flex",
                  alignSelf: "flex-start",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 22,
                  height: 22,
                  borderRadius: 11,
                  background: key === today ? "#8f6a39" : "transparent",
                  color: key === today ? "#fff" : "inherit",
                }}
              >
                {d.getDate()}
              </span>
              {items.slice(0, max).map((it) => chip(it, view === "woche"))}
              {items.length > max && <div className="td-light" style={{ fontSize: 11, marginTop: 3 }}>+{items.length - max} weitere</div>}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ marginTop: 14 }}>
          <div className="detail-label" style={{ marginBottom: 4 }}>
            {new Date(`${selected}T12:00:00`).toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          {selectedItems.length === 0 ? (
            <p className="td-light" style={{ fontSize: 12.5 }}>Keine Termine an diesem Tag.</p>
          ) : (
            selectedItems.map((it) => chip(it, true))
          )}
        </div>
      )}
    </div>
  );
}
