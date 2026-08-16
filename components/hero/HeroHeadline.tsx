"use client";

import { motion } from "motion/react";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const word = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HeroHeadline({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-balance font-display text-[clamp(2.75rem,7.5vw,6.75rem)] font-bold leading-[0.98] tracking-tighter text-ivory"
    >
      {words.map((w, i) => (
        <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1 align-bottom">
          <motion.span variants={word} className="inline-block">
            {w}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
