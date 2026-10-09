"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus } from "lucide-react";
import { AREAS, type AreaId } from "./areas";

const C = 360;
const R_OUT = 340;
const R_IN = 160;
const R_MID = (R_OUT + R_IN) / 2;
const KNOB = 22;

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) };
}

function pt(r: number, deg: number) {
  const p = polar(r, deg);
  return `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
}

/**
 * Ringsegment mit Puzzle-Nase an der Endkante und passender Kerbe an der
 * Startkante. Beide wölben sich im Uhrzeigersinn, dadurch greift die Nase
 * eines Teils genau in die Kerbe des nächsten.
 */
function piecePath(a0: number, a1: number) {
  return [
    `M ${pt(R_OUT, a0)}`,
    `A ${R_OUT} ${R_OUT} 0 0 1 ${pt(R_OUT, a1)}`,
    `L ${pt(R_MID + KNOB, a1)}`,
    `A ${KNOB} ${KNOB} 0 0 1 ${pt(R_MID - KNOB, a1)}`,
    `L ${pt(R_IN, a1)}`,
    `A ${R_IN} ${R_IN} 0 0 0 ${pt(R_IN, a0)}`,
    `L ${pt(R_MID - KNOB, a0)}`,
    `A ${KNOB} ${KNOB} 0 0 0 ${pt(R_MID + KNOB, a0)}`,
    "Z",
  ].join(" ");
}

// Reihenfolge wie auf der Uhr ab 12 Uhr: 01 oben rechts, 02 unten rechts,
// 03 unten links, 04 oben links.
const PIECES = AREAS.map((area, i) => {
  const a0 = i * 90;
  const a1 = a0 + 90;
  const mid = a0 + 45;
  const rad = ((mid - 90) * Math.PI) / 180;
  return {
    area,
    d: piecePath(a0, a1),
    label: polar(R_MID + 6, mid),
    dir: { x: Math.cos(rad), y: Math.sin(rad) },
  };
});

export function PuzzleHub({ onSelect }: { onSelect: (id: AreaId) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(SVGGElement | null)[]>([]);
  const centerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 85%",
          end: "center 55%",
          scrub: 0.6,
        },
      });

      tl.fromTo(
        pieceRefs.current,
        {
          x: (i: number) => PIECES[i].dir.x * 150,
          y: (i: number) => PIECES[i].dir.y * 150,
          rotation: (i: number) => (i % 2 === 0 ? -22 : 22),
          opacity: 0.12,
          transformOrigin: "50% 50%",
        },
        { x: 0, y: 0, rotation: 0, opacity: 1, ease: "power3.out", duration: 1, stagger: 0.08 }
      )
        .fromTo(centerRef.current, { scale: 0.7, opacity: 0.3 }, { scale: 1, opacity: 1, ease: "power2.out", duration: 1 }, 0)
        .fromTo(glowRef.current, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 1.2)
        .to(glowRef.current, { opacity: 0, duration: 0.35 });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  function onKey(e: KeyboardEvent<SVGGElement>, id: AreaId) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(id);
    }
  }

  const active = hovered !== null ? PIECES[hovered].area : null;

  return (
    <div ref={wrapRef} className="relative mx-auto aspect-square w-full max-w-[720px]">
      <svg viewBox="0 0 720 720" className="absolute inset-0 h-full w-full overflow-visible">
        <circle cx={C} cy={C} r={R_OUT + 14} fill="none" stroke="var(--color-line)" strokeDasharray="2 8" />
        <circle
          ref={glowRef}
          cx={C}
          cy={C}
          r={R_OUT + 4}
          fill="none"
          stroke="var(--color-amber)"
          strokeWidth={3}
          opacity={0}
          style={{ filter: "drop-shadow(0 0 18px rgba(143,106,57,0.28))" }}
        />

        {PIECES.map((p, i) => {
          const Icon = p.area.icon;
          const isHover = hovered === i;
          return (
            <g
              key={p.area.id}
              ref={(el) => {
                pieceRefs.current[i] = el;
              }}
            >
              <g
                role="button"
                tabIndex={0}
                aria-label={`${p.area.title} ansehen`}
                onClick={() => onSelect(p.area.id)}
                onKeyDown={(e) => onKey(e, p.area.id)}
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                className="cursor-pointer outline-none"
                style={{
                  transform: isHover ? `translate(${p.dir.x * 12}px, ${p.dir.y * 12}px)` : "translate(0, 0)",
                  transition: "transform .35s cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <path
                  d={p.d}
                  fill={isHover ? "#efe5d3" : "#ffffff"}
                  stroke={isHover ? "var(--color-amber)" : "rgba(31,29,26,0.12)"}
                  strokeWidth={isHover ? 2 : 1.5}
                  style={{ transition: "fill .3s, stroke .3s" }}
                />
                <foreignObject x={p.label.x - 100} y={p.label.y - 66} width={200} height={132} className="pointer-events-none">
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <span className="font-mono text-[15px] tracking-[0.2em] text-blueprint">{p.area.num}</span>
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                        isHover ? "border-amber bg-amber/15 text-amber" : "border-white/15 text-amber-soft"
                      } transition-colors`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <span className="font-display text-[22px] font-semibold leading-tight text-ivory">{p.area.title}</span>
                  </div>
                </foreignObject>
              </g>
            </g>
          );
        })}
      </svg>

      <div
        ref={centerRef}
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[6px] border-ink-3 shadow-[0_0_0_1px_rgba(143,106,57,0.28),0_30px_80px_-20px_rgba(41,37,27,0.35)]"
      >
        <Image
          src="/images/novidom-holzhaus.webp"
          alt=""
          fill
          sizes="(min-width: 768px) 300px, 42vw"
          className={`object-cover transition-transform duration-700 ${active ? "scale-110" : "scale-100"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink/85" />
        <div className="absolute inset-x-0 bottom-[16%] px-4 text-center">
          <div className="whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.16em] text-amber-soft sm:text-[10px] sm:tracking-[0.24em]">
            {active ? `${active.num} · NoviDom 360°` : "NoviDom 360°"}
          </div>
          <div className="mt-1 font-display text-base font-semibold leading-tight text-ivory sm:text-2xl">
            {active ? active.title : "Ihre Immobilie."}
          </div>
          {active && (
            <div className="mt-1 hidden items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-wider text-amber sm:flex">
              <Plus className="h-3 w-3" strokeWidth={2} /> Ansehen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
