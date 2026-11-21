"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { WegGruppe } from "@/lib/wegweiser";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Durchsuchbarer Wegweiser: Frage eintippen, Treffer zeigt wo es ist (mit Link). */
export function Wegweiser({ gruppen }: { gruppen: WegGruppe[] }) {
  const [q, setQ] = useState("");
  const gefiltert = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return gruppen;
    return gruppen
      .map((g) => ({
        ...g,
        wege: g.wege.filter((w) => {
          const hay = norm(`${w.frage} ${w.wo} ${w.stichworte ?? ""} ${g.titel}`);
          return words.every((word) => hay.includes(word));
        }),
      }))
      .filter((g) => g.wege.length > 0);
  }, [q, gruppen]);

  return (
    <div>
      <input
        type="search"
        className="search-input"
        style={{ width: "100%", maxWidth: 520, fontSize: 15, padding: "10px 14px" }}
        placeholder="Wonach suchen Sie? z.B. Provision, Instagram, doppelt, Exposé"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {gefiltert.length === 0 && (
        <div className="card" style={{ padding: 16, marginTop: 14 }}>
          Nichts gefunden. Anderes Wort versuchen, oder bei Walter oder Nicolaj nachfragen.
        </div>
      )}
      <div style={{ display: "grid", gap: 14, marginTop: 14, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        {gefiltert.map((g) => (
          <div key={g.titel} className="card" style={{ padding: 0 }}>
            <div className="card-header">
              <div className="card-title">{g.titel}</div>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: "4px 0" }}>
              {g.wege.map((w) => (
                <li key={w.frage} style={{ borderTop: "1px solid var(--border)" }}>
                  <Link href={w.href} style={{ display: "block", padding: "10px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{w.frage} →</div>
                    <div className="td-light" style={{ fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
                      {w.wo}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
