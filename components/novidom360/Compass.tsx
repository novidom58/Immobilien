"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Compass as CompassIcon, Home, X } from "lucide-react";
import { AREAS, type AreaId } from "./areas";

type Dir = "n" | "e" | "s" | "w";

const DIRS: Dir[] = ["n", "e", "s", "w"];
const NODE_POS: Record<Dir, string> = {
  n: "left-1/2 top-[2%] -translate-x-1/2",
  e: "right-[-2%] top-1/2 -translate-y-1/2 sm:right-[-8%]",
  s: "bottom-[2%] left-1/2 -translate-x-1/2",
  w: "left-[-2%] top-1/2 -translate-y-1/2 sm:left-[-8%]",
};
const IDLE_HINT = "Halten, ziehen, loslassen";

function dirAt(angle: number): Dir {
  if (angle > -45 && angle <= 45) return "e";
  if (angle > 45 && angle <= 135) return "s";
  if (angle > -135 && angle <= -45) return "n";
  return "w";
}

/**
 * Schwebender "NoviDom 360°"-Kompass: das Haus in der Mitte lässt sich in
 * eine der vier Richtungen ziehen; beim Loslassen öffnet sich der Bereich.
 */
export function Compass({ onSelect }: { onSelect: (id: AreaId) => void }) {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState<Dir | null>(null);
  const [visible, setVisible] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const drag = useRef({ active: false, cx: 0, cy: 0, half: 0, maxR: 0, armed: null as Dir | null });

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function choose(dir: Dir) {
    setOpen(false);
    onSelect(AREAS[DIRS.indexOf(dir)].id);
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dialRef.current || !centerRef.current) return;
    e.preventDefault();
    centerRef.current.setPointerCapture(e.pointerId);
    const r = dialRef.current.getBoundingClientRect();
    drag.current = { active: true, cx: r.left + r.width / 2, cy: r.top + r.height / 2, half: r.width / 2, maxR: r.width * 0.24, armed: null };
    centerRef.current.style.transition = "none";
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active || !centerRef.current || !lineRef.current) return;
    const dx = e.clientX - d.cx;
    const dy = e.clientY - d.cy;
    const len = Math.hypot(dx, dy) || 1;
    const dist = Math.min(len, d.maxR);
    const px = (dx / len) * dist;
    const py = (dy / len) * dist;
    centerRef.current.style.transform = `translate(${px}px, ${py}px)`;
    lineRef.current.setAttribute("x1", String(d.half));
    lineRef.current.setAttribute("y1", String(d.half));
    lineRef.current.setAttribute("x2", String(d.half + px));
    lineRef.current.setAttribute("y2", String(d.half + py));

    const next = dist > d.maxR * 0.3 ? dirAt((Math.atan2(dy, dx) * 180) / Math.PI) : null;
    if (next !== d.armed) {
      d.armed = next;
      setArmed(next);
    }
  }

  function endDrag() {
    const d = drag.current;
    if (!d.active || !centerRef.current) return;
    d.active = false;
    const el = centerRef.current;
    el.style.transition = "transform .4s cubic-bezier(.2,.8,.2,1)";
    el.style.transform = "translate(0, 0)";
    const target = d.armed;
    d.armed = null;
    setArmed(null);
    if (target) setTimeout(() => choose(target), 180);
  }

  const armedLabel = armed ? AREAS[DIRS.indexOf(armed)].compassLabel : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="NoviDom 360° öffnen"
        className={`group fixed bottom-28 left-6 z-[55] flex h-14 w-14 items-center justify-center rounded-full border border-line bg-ink-2 text-amber-soft shadow-[0_8px_28px_-8px_rgba(0,0,0,0.6)] transition-all duration-300 hover:border-amber/50 sm:bottom-8 ${visible ? "opacity-100 motion-safe:animate-[nd-bob_5s_ease-in-out_infinite]" : "pointer-events-none translate-y-4 opacity-0"}`}
      >
        <CompassIcon className="h-6 w-6" strokeWidth={1.5} />
        <span className="pointer-events-none absolute left-[68px] whitespace-nowrap rounded-full border border-line bg-ink-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ivory-dim opacity-0 transition-opacity group-hover:opacity-100">
          NoviDom 360°
        </span>
      </button>

      {open && (
        <div
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label="NoviDom 360°"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-7 bg-ink/95 px-4 pb-10 pt-20 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Schliessen"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ink-2 text-ivory-dim hover:text-ivory"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>

          <div className="text-center">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-blueprint">NoviDom 360°</div>
            <p className="mt-2 text-sm text-ivory-dim">Ziehen Sie das Haus in eine Richtung, oder tippen Sie direkt auf einen Bereich.</p>
          </div>

          <div ref={dialRef} className="relative aspect-square w-[min(420px,84vw)]">
            <div aria-hidden className="absolute inset-[8%] rounded-full border border-dashed border-line motion-safe:animate-[nd-spin_40s_linear_infinite]" />
            <svg aria-hidden className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible">
              <line ref={lineRef} stroke="var(--color-amber)" strokeWidth={2} opacity={armed ? 0.8 : 0} />
            </svg>

            <div
              ref={centerRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className="absolute inset-0 z-[3] m-auto flex aspect-square w-[36%] cursor-grab touch-none flex-col items-center justify-center rounded-full border border-amber bg-[radial-gradient(circle_at_40%_30%,var(--color-ink-2),var(--color-ink))] text-center shadow-[0_0_40px_-8px_rgba(232,168,85,0.45)] active:cursor-grabbing"
            >
              <Home className="h-7 w-7 text-amber-soft" strokeWidth={1.5} />
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ivory-dim">
                Ihre
                <br />
                Immobilie
              </span>
            </div>

            {DIRS.map((dir, i) => {
              const area = AREAS[i];
              const Icon = area.icon;
              const isArmed = armed === dir;
              return (
                <button
                  key={dir}
                  type="button"
                  onClick={() => choose(dir)}
                  className={`group absolute flex w-[86px] flex-col items-center gap-1.5 text-center sm:w-[104px] ${NODE_POS[dir]}`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full border bg-ink-2 text-amber-soft transition-all sm:h-12 sm:w-12 ${
                      isArmed
                        ? "scale-[1.14] border-amber bg-[#1d2535] shadow-[0_0_24px_-4px_rgba(232,168,85,0.75)]"
                        : "border-line group-hover:-translate-y-0.5 group-hover:border-amber"
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ivory-dim">{area.compassLabel}</span>
                </button>
              );
            })}
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ivory-dim">
            {armedLabel ? `Loslassen für ${armedLabel}` : IDLE_HINT}
          </p>
        </div>
      )}
    </>
  );
}
