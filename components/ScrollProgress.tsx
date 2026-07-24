"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <div className="fixed inset-y-0 left-0 z-40 hidden w-px bg-line lg:block">
      <motion.div
        className="w-full origin-top bg-gradient-to-b from-amber to-amber-soft"
        style={{ scaleY, height: "100%" }}
      />
    </div>
  );
}
