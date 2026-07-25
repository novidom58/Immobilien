"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import type { ReactNode, MouseEvent } from "react";

const buttonClasses =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-amber px-8 py-4 font-display text-sm font-semibold uppercase tracking-wide text-ink shadow-[0_0_40px_-8px_rgba(232,168,85,0.65)] transition-shadow hover:shadow-[0_0_60px_-6px_rgba(232,168,85,0.85)]";

function useMagneticHandlers() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 12 });
  const springY = useSpring(y, { stiffness: 150, damping: 12 });

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return { springX, springY, handleMouseMove, handleMouseLeave };
}

function ButtonContent({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
      >
        &rarr;
      </span>
    </>
  );
}

export function MagneticButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const { springX, springY, handleMouseMove, handleMouseLeave } = useMagneticHandlers();

  return (
    <motion.a
      href={href}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      className={`${buttonClasses} ${className}`}
    >
      <ButtonContent>{children}</ButtonContent>
    </motion.a>
  );
}

export function MagneticSubmitButton({
  children,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { springX, springY, handleMouseMove, handleMouseLeave } = useMagneticHandlers();

  return (
    <motion.button
      type="submit"
      disabled={disabled}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      className={`${buttonClasses} ${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <ButtonContent>{children}</ButtonContent>
    </motion.button>
  );
}
