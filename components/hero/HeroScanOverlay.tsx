"use client";

import { motion } from "motion/react";

const CORNERS = [
  "left-6 top-6 border-l border-t lg:left-10 lg:top-32",
  "right-6 top-6 border-r border-t lg:right-10 lg:top-32",
  "left-6 bottom-6 border-l border-b lg:left-10",
  "right-6 bottom-6 border-r border-b lg:right-10",
];

export function HeroScanOverlay() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 4.4, duration: 1.1, ease: "easeInOut" }}
      aria-hidden
    >
      {/* Blueprint grid, strongest while the first (sketch) frame shows */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(95,184,232,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(95,184,232,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        initial={{ opacity: 0.55 }}
        animate={{ opacity: [0.55, 0.22, 0] }}
        transition={{ duration: 4.2, times: [0, 0.4, 1], ease: "easeInOut" }}
      />

      {/* HUD corner brackets */}
      {CORNERS.map((pos, i) => (
        <motion.div
          key={pos}
          className={`absolute h-9 w-9 border-blueprint/70 lg:h-12 lg:w-12 ${pos}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 0.35 + i * 0.08, duration: 4.1, times: [0, 0.15, 0.72, 1] }}
        />
      ))}

      {/* Scan-line sweep */}
      <motion.div
        className="absolute inset-x-0 h-px bg-blueprint shadow-[0_0_24px_4px_rgba(95,184,232,0.65)]"
        initial={{ top: "0%", opacity: 0 }}
        animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
        transition={{ delay: 0.25, duration: 1.5, ease: "easeInOut" }}
      />

      {/* Technical readout label */}
      <motion.span
        className="absolute bottom-28 left-6 font-mono text-[10px] uppercase tracking-[0.3em] text-blueprint lg:bottom-32 lg:left-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ delay: 0.5, duration: 3.4, times: [0, 0.18, 0.72, 1] }}
      >
        Rendering Zuhause…
      </motion.span>
    </motion.div>
  );
}
