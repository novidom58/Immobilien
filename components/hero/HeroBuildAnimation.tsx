"use client";

import { motion } from "motion/react";

const wallLeft = 300;
const wallRight = 700;
const wallTop = 260;
const wallBottom = 480;
const roofApex = { x: 500, y: 140 };
const roofLeft = { x: 278, y: wallTop };
const roofRight = { x: 722, y: wallTop };

const windows = [
  { x: 335, y: 292, w: 66, h: 64 },
  { x: 432, y: 292, w: 66, h: 64 },
  { x: 335, y: 396, w: 66, h: 58 },
  { x: 588, y: 292, w: 92, h: 162 },
];

const door = { x: 460, y: 382, w: 78, h: 98 };

const ease = [0.65, 0, 0.35, 1] as const;

function DrawLine({
  d,
  delay,
  duration = 0.5,
  color = "var(--color-blueprint)",
  width = 2,
}: {
  d: string;
  delay: number;
  duration?: number;
  color?: string;
  width?: number;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay, duration, ease }}
    />
  );
}

export function HeroBuildAnimation() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,#1a2130_0%,#0a0d12_65%)]" />

      <svg
        viewBox="0 0 1000 750"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5fb8e8" strokeWidth="0.5" />
          </pattern>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.rect
          x="0"
          y="0"
          width="1000"
          height="750"
          fill="url(#blueprint-grid)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0.12] }}
          transition={{ duration: 2, times: [0, 0.4, 1], ease }}
        />

        {/* Basel skyline silhouette */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 0.4, duration: 1.5 }}
          fill="#141a24"
        >
          <path d="M780 480 L780 260 L795 220 L800 260 L800 480 Z" />
          <path d="M815 480 L815 250 L830 205 L845 250 L845 480 Z" />
          <rect x="740" y="380" width="30" height="100" />
          <rect x="855" y="410" width="40" height="70" />
        </motion.g>

        {/* Ground + reflection strip (pool) */}
        <line x1="120" y1={wallBottom + 40} x2="880" y2={wallBottom + 40} stroke="#ffffff14" strokeWidth="1.5" />
        <motion.rect
          x="260"
          y={wallBottom + 55}
          width="480"
          height="18"
          rx="9"
          fill="var(--color-blueprint)"
          initial={{ opacity: 0.08 }}
          animate={{ opacity: [0.08, 0.08, 0.55] }}
          transition={{ delay: 3.6, duration: 1.4, ease, times: [0, 0.3, 1] }}
          style={{ filter: "url(#glow)" }}
        />

        {/* Dimension annotations */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 0.3, duration: 2.2, times: [0, 0.2, 0.75, 1] }}
          className="font-mono"
          fill="var(--color-blueprint)"
        >
          <text x="130" y="370" fontSize="14" textAnchor="middle" transform="rotate(-90 130 370)">
            6.80 m
          </text>
          <line x1="150" y1={wallTop} x2="150" y2={wallBottom} stroke="var(--color-blueprint)" strokeWidth="1" />
          <text x="500" y="545" fontSize="14" textAnchor="middle">
            12.00 m
          </text>
          <line x1={wallLeft} y1="525" x2={wallRight} y2="525" stroke="var(--color-blueprint)" strokeWidth="1" />
        </motion.g>

        {/* Foundation */}
        <DrawLine d={`M ${wallLeft - 20} ${wallBottom} L ${wallRight + 20} ${wallBottom}`} delay={0.2} duration={0.6} />
        {[0, 1, 2, 3, 4].map((i) => (
          <DrawLine
            key={`pier-${i}`}
            d={`M ${wallLeft + 20 + i * 90} ${wallBottom} L ${wallLeft + 20 + i * 90} ${wallBottom + 18}`}
            delay={0.6 + i * 0.05}
            duration={0.3}
          />
        ))}

        {/* Walls */}
        <DrawLine d={`M ${wallLeft} ${wallBottom} L ${wallLeft} ${wallTop}`} delay={1.0} duration={0.55} />
        <DrawLine d={`M ${wallRight} ${wallBottom} L ${wallRight} ${wallTop}`} delay={1.05} duration={0.55} />
        <DrawLine d={`M ${wallLeft} ${wallTop} L ${wallRight} ${wallTop}`} delay={1.5} duration={0.4} />

        {/* Roof */}
        <DrawLine d={`M ${roofLeft.x} ${roofLeft.y} L ${roofApex.x} ${roofApex.y}`} delay={1.85} duration={0.5} />
        <DrawLine d={`M ${roofRight.x} ${roofRight.y} L ${roofApex.x} ${roofApex.y}`} delay={1.9} duration={0.5} />

        {/* Solid fills fade in — the structure becomes physical */}
        <motion.rect
          x={wallLeft}
          y={wallTop}
          width={wallRight - wallLeft}
          height={wallBottom - wallTop}
          fill="#1b212c"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.35, duration: 0.7, ease }}
        />
        <motion.path
          d={`M ${roofLeft.x} ${roofLeft.y} L ${roofApex.x} ${roofApex.y} L ${roofRight.x} ${roofRight.y} Z`}
          fill="#141922"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.55, duration: 0.7, ease }}
        />

        {/* Door */}
        <motion.rect
          x={door.x}
          y={door.y}
          width={door.w}
          height={door.h}
          fill="#0d1015"
          stroke="var(--color-line)"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          style={{ transformOrigin: `${door.x + door.w / 2}px ${door.y + door.h}px` }}
          transition={{ delay: 2.9, duration: 0.5, ease }}
        />

        {/* Windows — dark frames appear, then light up warm one by one */}
        {windows.map((w, i) => (
          <g key={i}>
            <motion.rect
              x={w.x}
              y={w.y}
              width={w.w}
              height={w.h}
              fill="#0d1015"
              stroke="var(--color-line)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.7 + i * 0.08, duration: 0.4 }}
            />
            <motion.rect
              x={w.x}
              y={w.y}
              width={w.w}
              height={w.h}
              fill="var(--color-amber)"
              style={{ filter: "url(#glow)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.95, 0.8, 0.95] }}
              transition={{
                delay: 3.4 + i * 0.18,
                duration: 3,
                times: [0, 0.05, 0.15, 0.55, 1],
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
