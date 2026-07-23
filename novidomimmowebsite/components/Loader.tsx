"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function Loader() {
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only media check, must run post-mount to stay hydration-safe
      setPhase("done");
      return;
    }

    document.body.style.overflow = "hidden";
    const exitTimer = setTimeout(() => setPhase("exiting"), 1200);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, 2100);

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
          <div className="overflow-hidden">
            <motion.span
              className="block font-display text-4xl font-semibold tracking-tight text-ivory lg:text-6xl"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              Novi<span className="text-amber">Dom</span>
            </motion.span>
          </div>
          <div className="mt-1 overflow-hidden">
            <motion.span
              className="block font-display text-lg font-medium tracking-[0.3em] text-amber-soft uppercase"
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            >
              Immo
            </motion.span>
          </div>
          <motion.span
            className="mt-8 block h-0 w-px bg-gradient-to-b from-amber to-transparent"
            initial={{ height: 0 }}
            animate={{ height: 56 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.55 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
