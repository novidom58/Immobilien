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

function Words({ text, className = "" }: { text: string; className?: string }) {
  return text.split(" ").map((w, i) => (
    <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1 align-bottom">
      <motion.span variants={word} className={`inline-block ${className}`}>
        {w}
      </motion.span>
    </span>
  ));
}

export function HeroHeadline({ text, accent }: { text: string; accent?: string }) {
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-balance font-display text-[clamp(2.6rem,6vw,5.4rem)] font-normal leading-[1.04] tracking-[-0.035em] text-ivory"
    >
      <Words text={text} />
      {accent && (
        <>
          <br />
          <Words text={accent} className="italic" />
        </>
      )}
    </motion.h1>
  );
}
