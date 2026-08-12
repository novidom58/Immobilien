"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

// Grosse Schlüssel-öffnet-Schloss-Sequenz als Hero-Intro: reines SVG/CSS,
// kein generiertes Bild oder Video nötig. Pseudo-3D-Dreheffekt über
// scaleX-Verjüngung während der Drehung (klassischer 2.5D-Trick) plus
// metallischer Gradient + Tiefenschatten, damit es trotz flacher SVG-
// Geometrie "gedreht" statt nur rotiert wirkt.
// `start=false` renders only the opaque cover (no animation yet) so the real
// Hero content underneath is never visible before its cue - the sitewide
// Loader (components/Loader.tsx) covers the first LOADER_DURATION_MS, then
// the parent flips `start` and this takes over seamlessly, no flash between.
export function HeroKeyUnlock({ start, onDone }: { start: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!start) return;
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [start, onDone]);

  const CX = 220;
  const CY = 200;

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center bg-ink"
      initial={{ opacity: 1 }}
      animate={start ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.75, ease: "easeInOut" }}
    >
      {start && (
      <svg viewBox="0 0 440 400" className="h-[70vmin] w-[70vmin] max-h-[520px] max-w-[520px]" aria-hidden>
        <defs>
          <linearGradient id="hkuMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f2c177" />
            <stop offset="45%" stopColor="#e8a855" />
            <stop offset="55%" stopColor="#f4f1ea" />
            <stop offset="100%" stopColor="#e8a855" />
          </linearGradient>
          <radialGradient id="hkuFlash" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2c177" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#e8a855" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e8a855" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Rotierender Deko-Ring - läuft die ganze Zeit, futuristisches HUD-Gefühl */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={150}
          stroke="var(--color-blueprint)"
          strokeWidth={1}
          strokeDasharray="2 10"
          fill="none"
          opacity={0.4}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, ease: "linear", repeat: Infinity }}
          style={{ originX: `${CX}px`, originY: `${CY}px` }}
        />

        {/* Schlossring */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={100}
          stroke="var(--color-blueprint)"
          strokeWidth={2.5}
          fill="none"
          filter="drop-shadow(0 0 10px rgba(95,184,232,0.5))"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Schlüsselloch */}
        <motion.g
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          style={{ originX: `${CX}px`, originY: `${CY - 10}px` }}
        >
          <circle cx={CX} cy={CY - 12} r={13} fill="url(#hkuMetal)" />
          <path d={`M${CX - 13} ${CY - 3} L${CX + 13} ${CY - 3} L${CX + 5} ${CY + 26} L${CX - 5} ${CY + 26} Z`} fill="url(#hkuMetal)" />
        </motion.g>

        {/* Schlüssel: gleitet ein, dreht sich mit Pseudo-3D-Squish */}
        <motion.g
          initial={{ x: -190, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ x: { duration: 0.45, delay: 0.55, ease: "easeOut" }, opacity: { duration: 0.25, delay: 0.55 } }}
        >
          <motion.g
            initial={{ rotate: 0, scaleX: 1 }}
            animate={{ rotate: [0, 0, 78], scaleX: [1, 1, 0.45, 1] }}
            transition={{ duration: 0.45, delay: 1.0, times: [0, 0.15, 0.6, 1], ease: [0.34, 1.56, 0.64, 1] }}
            style={{ originX: `${CX}px`, originY: `${CY}px` }}
          >
            <circle cx={CX - 148} cy={CY} r={34} stroke="url(#hkuMetal)" strokeWidth={5} fill="none" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.4))" />
            <line x1={CX - 114} y1={CY} x2={CX - 2} y2={CY} stroke="url(#hkuMetal)" strokeWidth={5} strokeLinecap="round" />
            <line x1={CX - 34} y1={CY} x2={CX - 34} y2={CY + 18} stroke="url(#hkuMetal)" strokeWidth={5} strokeLinecap="round" />
            <line x1={CX - 16} y1={CY} x2={CX - 16} y2={CY + 26} stroke="url(#hkuMetal)" strokeWidth={5} strokeLinecap="round" />
          </motion.g>
        </motion.g>

        {/* Lichtstrahlen beim Aufschliessen */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <motion.line
            key={deg}
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - 70}
            stroke="var(--color-amber-soft)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ opacity: 0, scaleY: 0.3 }}
            animate={{ opacity: [0, 0.9, 0], scaleY: [0.3, 1.4, 1.8] }}
            transition={{ duration: 0.5, delay: 1.45, ease: "easeOut" }}
            style={{ originX: `${CX}px`, originY: `${CY}px`, transform: `rotate(${deg}deg)` }}
          />
        ))}

        {/* Blitz-Burst */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={12}
          fill="url(#hkuFlash)"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 9, opacity: [0, 1, 0] }}
          transition={{ duration: 0.55, delay: 1.4, ease: "easeOut" }}
          style={{ originX: `${CX}px`, originY: `${CY}px` }}
        />
      </svg>
      )}
    </motion.div>
  );
}
