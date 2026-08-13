"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { playUnlockSound } from "@/lib/unlockSound";

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
    const doneTimer = setTimeout(onDone, 2650);
    // Zeitlich auf Schlüsseldreh (~0.9s) + Aufschluss-Blitz (~1.3s) der
    // 3D-Sequenz abgestimmt. Browser blockieren Ton ohne vorherige
    // Nutzer-Geste beim allerersten Seitenaufruf - siehe lib/unlockSound.ts.
    const soundTimer = setTimeout(playUnlockSound, 900);
    return () => {
      clearTimeout(doneTimer);
      clearTimeout(soundTimer);
    };
  }, [start, onDone]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center bg-ink"
      initial={{ opacity: 1 }}
      animate={start ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.55, delay: 2.1, ease: "easeInOut" }}
    >
      {start && (
        <div className="h-[70vmin] w-[70vmin] max-h-[560px] max-w-[560px]">
          <HeroKeyUnlock3D />
        </div>
      )}
    </motion.div>
  );
}
