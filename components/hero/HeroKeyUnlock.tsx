"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";

// Echtes WebGL-3D (React Three Fiber) statt flachem SVG - eigenes Code-Bundle
// (nur hier geladen, kein Effekt auf andere Seiten) und komplett entladen,
// sobald die Sequenz vorbei ist. `start=false` zeigt nur die blickdichte
// Abdeckung (kein Canvas-Mount, kein GPU-Aufwand), bis der sitewide Loader
// (components/Loader.tsx) fertig ist und der Elternteil `start` umschaltet -
// so gibt es nie ein Aufblitzen des echten Hero-Inhalts dazwischen.
const HeroKeyUnlock3D = dynamic(() => import("./HeroKeyUnlock3D"), { ssr: false });

export function HeroKeyUnlock({ start, onDone }: { start: boolean; onDone: () => void }) {
  useEffect(() => {
    if (!start) return;
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [start, onDone]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center bg-ink"
      initial={{ opacity: 1 }}
      animate={start ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.75, ease: "easeInOut" }}
    >
      {start && (
        <div className="h-[70vmin] w-[70vmin] max-h-[560px] max-w-[560px]">
          <HeroKeyUnlock3D />
        </div>
      )}
    </motion.div>
  );
}
