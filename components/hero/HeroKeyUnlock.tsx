"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { playKeyClick, playDoorChime } from "@/lib/unlockSound";

// Echtes gefilmtes Intro (Schlüssel gleitet ins Schloss, Tür öffnet sich in
// eine grosse Eingangshalle) statt der früheren WebGL-Szene. Zeitpunkte sind
// auf public/videos/key-unlock.mp4 abgestimmt (5.25s, Türöffnung ab ~2.1s
// dank Schnitt/Crossfade - die lange Drehbewegung in der Mitte ist raus,
// damit man schnell auf der echten Seite landet).
const CLICK_DELAY_MS = 300;
const CHIME_DELAY_MS = 2100;
const SKIP_VISIBLE_DELAY_MS = 1500;
const FADE_MS = 550;
// Reiner Sicherheitsnetz-Timer, deutlich länger als die 5.25s Videolänge -
// greift nur, falls das Video nie ein "ended"-Event feuert (z.B. hängt beim
// Buffern fest), nicht als normale Abschaltung während es noch läuft.
const FALLBACK_DONE_MS = 8000;

export function HeroKeyUnlock({ start, onDone }: { start: boolean; onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [finishing, setFinishing] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (!start || finishing) return;

    function finish() {
      setFinishing(true);
      setTimeout(onDone, FADE_MS);
    }

    const video = videoRef.current;
    video?.play().catch(() => finish());

    const clickTimer = setTimeout(playKeyClick, CLICK_DELAY_MS);
    const chimeTimer = setTimeout(playDoorChime, CHIME_DELAY_MS);
    const skipTimer = setTimeout(() => setShowSkip(true), SKIP_VISIBLE_DELAY_MS);
    const fallbackTimer = setTimeout(finish, FALLBACK_DONE_MS);

    video?.addEventListener("ended", finish);

    return () => {
      clearTimeout(clickTimer);
      clearTimeout(chimeTimer);
      clearTimeout(skipTimer);
      clearTimeout(fallbackTimer);
      video?.removeEventListener("ended", finish);
    };
  }, [start, finishing, onDone]);

  function handleSkip() {
    setFinishing(true);
    setTimeout(onDone, FADE_MS);
  }

  return (
    <motion.div
      className="absolute inset-0 z-20 overflow-hidden bg-ink"
      initial={{ opacity: 1 }}
      animate={finishing ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
    >
      {start && (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster="/videos/key-unlock-poster.jpg"
          muted
          playsInline
          autoPlay
          preload="auto"
        >
          <source src="/videos/key-unlock.webm" type="video/webm" />
          <source src="/videos/key-unlock.mp4" type="video/mp4" />
        </video>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20" />

      {showSkip && !finishing && (
        <motion.button
          type="button"
          onClick={handleSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-8 right-8 z-30 font-mono text-xs uppercase tracking-wide text-ivory-dim/70 underline underline-offset-4 hover:text-ivory"
        >
          Überspringen →
        </motion.button>
      )}
    </motion.div>
  );
}
