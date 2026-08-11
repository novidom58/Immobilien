"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// Schlüssel dreht sich ins Schloss, das Schloss öffnet sich (Lichtblitz),
// dann erscheint die Marke - passend zum Kerngeschäft (Zugang zum neuen
// Zuhause) und rein SVG/CSS-animiert, unabhängig von generierten Bildern.
function KeyUnlock() {
  return (
    <svg width="200" height="107" viewBox="0 0 200 107" fill="none" aria-hidden>
      {/* Schloss */}
      <motion.circle
        cx="150"
        cy="53"
        r="32"
        stroke="var(--color-blueprint)"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.1 }}>
        <circle cx="150" cy="47" r="6" fill="var(--color-amber)" />
        <path d="M144 51 L156 51 L151 63 L149 63 Z" fill="var(--color-amber)" />
      </motion.g>

      {/* Schlüssel: gleitet ein, dreht sich */}
      <motion.g
        initial={{ x: -70, rotate: 0, opacity: 0 }}
        animate={{ x: 0, rotate: [0, 0, 70], opacity: 1 }}
        transition={{
          x: { duration: 0.3, delay: 0.3, ease: "easeOut" },
          opacity: { duration: 0.2, delay: 0.3 },
          rotate: { duration: 0.25, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] },
        }}
        style={{ originX: "150px", originY: "47px" }}
      >
        <circle cx="112" cy="53" r="10" stroke="var(--color-ivory)" strokeWidth="1.5" />
        <line x1="122" y1="53" x2="151" y2="53" stroke="var(--color-ivory)" strokeWidth="1.5" />
        <line x1="141" y1="53" x2="141" y2="59" stroke="var(--color-ivory)" strokeWidth="1.5" />
        <line x1="147" y1="53" x2="147" y2="58" stroke="var(--color-ivory)" strokeWidth="1.5" />
      </motion.g>

      {/* Aufschluss-Blitz */}
      <motion.circle
        cx="150"
        cy="53"
        r="4"
        fill="none"
        stroke="var(--color-amber)"
        strokeWidth="2"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 5, opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.4, delay: 0.85, ease: "easeOut" }}
        style={{ originX: "150px", originY: "53px" }}
      />
    </svg>
  );
}

export function Loader() {
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only media check, must run post-mount to stay hydration-safe
      setPhase("done");
      return;
    }

    document.body.style.overflow = "hidden";
    const exitTimer = setTimeout(() => setPhase("exiting"), 1900);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, 2600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 1.05 }}
          >
            <KeyUnlock />
          </motion.div>

          <div className="-mt-16 overflow-hidden">
            <motion.span
              className="block font-display text-4xl font-semibold tracking-tight text-ivory lg:text-6xl"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.0 }}
            >
              Novi<span className="text-amber">Dom</span>
            </motion.span>
          </div>
          <div className="mt-1 overflow-hidden">
            <motion.span
              className="block font-display text-lg font-medium tracking-[0.3em] text-amber-soft uppercase"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.15 }}
            >
              Immo
            </motion.span>
          </div>
          <motion.span
            className="mt-8 block h-0 w-px bg-gradient-to-b from-amber to-transparent"
            initial={{ height: 0 }}
            animate={{ height: 56 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 1.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
