"use client";

import { motion } from "motion/react";

type Node = {
  key: string;
  label: string;
  x: number;
  y: number;
  hub?: boolean;
};

const NODES: Node[] = [
  { key: "basel", label: "Basel · Büro", x: 68, y: 58, hub: true },
  { key: "solothurn", label: "Solothurn", x: 128, y: 104 },
  { key: "aargau", label: "Aargau", x: 202, y: 68 },
  { key: "zuerich", label: "Zürich", x: 292, y: 56 },
  { key: "zug", label: "Zug · Büro", x: 270, y: 122, hub: true },
  { key: "luzern", label: "Luzern", x: 216, y: 176 },
];

const LINKS: [string, string][] = [
  ["basel", "solothurn"],
  ["basel", "aargau"],
  ["aargau", "zuerich"],
  ["aargau", "zug"],
  ["zug", "luzern"],
];

function nodeByKey(key: string) {
  return NODES.find((n) => n.key === key)!;
}

export function CoverageNetwork() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-ink p-4">
      <div aria-hidden className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l border-t border-blueprint/40" />
      <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r border-t border-blueprint/40" />
      <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b border-l border-blueprint/40" />
      <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b border-r border-blueprint/40" />

      <svg viewBox="0 0 360 220" className="h-auto w-full" role="img" aria-label="Einzugsgebiet Nordwestschweiz bis Zentralschweiz">
        {LINKS.map(([a, b], i) => {
          const from = nodeByKey(a);
          const to = nodeByKey(b);
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--color-blueprint)"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}

        {NODES.map((node, i) => (
          <g key={node.key}>
            {node.hub && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={11}
                fill="var(--color-amber)"
                fillOpacity={0.15}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: [1, 1.3, 1], opacity: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 2.4, delay: i * 0.15 + 0.3, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              />
            )}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.hub ? 5 : 3.5}
              fill={node.hub ? "var(--color-amber)" : "var(--color-amber-soft)"}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            />
            <motion.text
              x={node.x}
              y={node.hub ? node.y - 16 : node.y - 11}
              textAnchor="middle"
              className="font-mono uppercase"
              fontSize={node.hub ? 10 : 8.5}
              fill={node.hub ? "var(--color-ivory)" : "var(--color-ivory-dim)"}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.15 + 0.15 }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}
