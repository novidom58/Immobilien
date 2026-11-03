"use client";

import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { chf } from "@/lib/karriere";

type Stufe = { nr: number; titel: string; anteil: number; abImmo: number; abGesamt: number };

type Props = {
  immo: number;
  gesamt: number;
  stufeNr: number;
  stufen: Stufe[];
  abzug: number;
  fehltImmo: number;
  fehltGesamt: number;
  verkaeufeBisNaechste: number;
  verdient: number;
  beispiel: string;
};


function useCountUp(target: number, run: boolean, ms = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - start) / ms);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, run, ms]);
  return value;
}

function Track({
  label,
  value,
  marks,
  animate,
  delay,
}: {
  label: string;
  value: number;
  marks: { at: number; text: string }[];
  animate: boolean;
  delay: number;
}) {
  const max = Math.max(marks[marks.length - 1].at * 1.15, value * 1.05);
  const pct = Math.min(100, (value / max) * 100);
  const shown = useCountUp(value, animate);
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--ink-light)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>{chf(shown)}</span>
      </div>
      <div style={{ position: "relative", height: 14, marginTop: 8, borderRadius: 99, background: "var(--surface)", overflow: "visible" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: animate ? `${pct}%` : "0%",
            borderRadius: 99,
            background: "linear-gradient(90deg, var(--blue2), var(--gold))",
            boxShadow: "0 0 18px rgba(199,138,58,.35)",
            transition: `width 1.4s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
          }}
        />
        {marks.map((m) => (
          <div key={m.at} style={{ position: "absolute", left: `${(m.at / max) * 100}%`, top: -4, bottom: -4, width: 2, background: value >= m.at ? "var(--ink)" : "var(--border)" }} />
        ))}
      </div>
      <div style={{ position: "relative", height: 18, marginTop: 6, fontSize: 11, color: "var(--ink-light)" }}>
        {marks.map((m) => (
          <span key={m.at} style={{ position: "absolute", left: `${(m.at / max) * 100}%`, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
            {m.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Animierte Anzeige der Leistungsstaffel: wo die Person steht, wie viel bis
 * zur nächsten Stufe fehlt, und die drei Stufen als Karten.
 */
export function KarriereProgress(props: Props) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const current = props.stufen.find((s) => s.nr === props.stufeNr) ?? props.stufen[0];
  const next = props.stufen.find((s) => s.nr === props.stufeNr + 1) ?? null;
  const anteil = current.anteil - props.abzug;
  const shownAnteil = useCountUp(anteil, animate, 1000);
  const shownVerdient = useCountUp(props.verdient, animate);

  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gold)" }}>
              Stufe {current.nr} · {current.titel}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 56, lineHeight: 1, marginTop: 6, color: "var(--gold)" }}>
              {Math.round(shownAnteil)} %
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-light)", marginTop: 6 }}>dein Anteil an der Provision</div>
          </div>
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ fontSize: 13, color: "var(--ink-light)" }}>Dein Anteil aus den letzten 12 Monaten</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30, marginTop: 2 }}>{chf(shownVerdient)}</div>
            {next ? (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(199,138,58,.12)",
                  border: "1px solid rgba(199,138,58,.35)",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                <Sparkles size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2, color: "var(--gold)" }} />
                Noch <strong>{chf(props.fehltImmo)}</strong> Immobilien-Provision bis <strong>{next.anteil - props.abzug} %</strong>
                {props.verkaeufeBisNaechste > 0 && <> (ca. {props.verkaeufeBisNaechste} {props.verkaeufeBisNaechste === 1 ? "Verkauf" : "Verkäufe"} {props.beispiel})</>}, oder{" "}
                <strong>{chf(props.fehltGesamt)}</strong> Gesamtumsatz mit Versicherungen und Hypotheken.
              </div>
            ) : (
              <div style={{ marginTop: 12, fontSize: 13, color: "var(--green)" }}>
                <Check size={14} style={{ display: "inline", marginRight: 6, verticalAlign: -2 }} />
                Höchste Stufe erreicht: gleich viel wie die Partner.
              </div>
            )}
          </div>
        </div>

        <Track
          label="Immobilien-Provision, letzte 12 Monate"
          value={props.immo}
          animate={animate}
          delay={150}
          marks={props.stufen.filter((s) => s.abImmo > 0).map((s) => ({ at: s.abImmo, text: `${s.anteil - props.abzug} % ab ${Math.round(s.abImmo / 1000)}k` }))}
        />
        <Track
          label="Gesamt inkl. Versicherungen und Hypotheken"
          value={props.gesamt}
          animate={animate}
          delay={350}
          marks={props.stufen.filter((s) => s.abGesamt > 0).map((s) => ({ at: s.abGesamt, text: `${s.anteil - props.abzug} % ab ${Math.round(s.abGesamt / 1000)}k` }))}
        />
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 16 }}>
        {props.stufen.map((s, i) => {
          const active = s.nr === current.nr;
          const reached = s.nr < current.nr;
          return (
            <div
              key={s.nr}
              className="card"
              style={{
                padding: 18,
                background: active ? "var(--ink)" : undefined,
                color: active ? "var(--bg)" : undefined,
                transform: animate ? "translateY(0)" : "translateY(14px)",
                opacity: animate ? 1 : 0,
                transition: `transform .6s ease ${500 + i * 120}ms, opacity .6s ease ${500 + i * 120}ms`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--gold)" }}>
                  Stufe {s.nr} · {s.titel}
                </span>
                {active && (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: "var(--gold)", color: "var(--bg)" }}>Du bist hier</span>
                )}
                {reached && <Check size={16} style={{ color: "var(--green)" }} />}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, marginTop: 6, color: active ? "var(--gold)" : undefined }}>
                {s.anteil - props.abzug} %
              </div>
              <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
                {s.abImmo === 0 ? "Einstieg" : `ab ${chf(s.abImmo)} Immobilien`}
              </div>
              {s.abGesamt > 0 && <div style={{ fontSize: 12, marginTop: 2, opacity: 0.7 }}>oder ab {chf(s.abGesamt)} gesamt</div>}
              {s.nr === 3 && <div style={{ fontSize: 12, marginTop: 8, fontWeight: 600, color: "var(--gold)" }}>Gleich viel wie die Partner</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
