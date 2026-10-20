// Isometrische Projektion für die SVG-Animationen: x nach rechts hinten,
// y nach links hinten, z nach oben.
export const S = 26;
const C30 = 0.866;

export function iso(x: number, y: number, z: number) {
  return [(x - y) * C30 * S, (x + y) * 0.5 * S - z * S] as const;
}

export function pts(...p: [number, number, number][]) {
  return p.map(([x, y, z]) => iso(x, y, z).join(",")).join(" ");
}

export type Box = { x: number; y: number; z: number; dx: number; dy: number; dz: number };

/** Sichtbare Flächen eines Quaders: oben, rechts (x = Ende), links vorne (y = Ende). */
export function Block({ b, top, right, left }: { b: Box; top: string; right: string; left: string }) {
  const x1 = b.x + b.dx;
  const y1 = b.y + b.dy;
  const z1 = b.z + b.dz;
  return (
    <g stroke="#191b1d" strokeOpacity="0.18" strokeWidth="0.8" strokeLinejoin="round">
      <polygon points={pts([x1, b.y, b.z], [x1, y1, b.z], [x1, y1, z1], [x1, b.y, z1])} fill={right} />
      <polygon points={pts([b.x, y1, b.z], [x1, y1, b.z], [x1, y1, z1], [b.x, y1, z1])} fill={left} />
      <polygon points={pts([b.x, b.y, z1], [x1, b.y, z1], [x1, y1, z1], [b.x, y1, z1])} fill={top} />
    </g>
  );
}
