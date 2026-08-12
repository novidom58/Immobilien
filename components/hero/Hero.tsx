"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { HeroHeadline } from "./HeroHeadline";
import { ValuationWidget } from "./ValuationWidget";
import { HeroKeyUnlock } from "./HeroKeyUnlock";
import { LOADER_DURATION_MS } from "@/components/Loader";
import { createClient } from "@/lib/supabase/client";

// Generisches KI-Bild als Fallback, solange noch kein echtes Objekt online ist.
// Sobald ein aktives Inserat mit Foto existiert, ersetzt useEffect unten dieses
// Bild automatisch durch ein echtes Objektfoto - das ist der eigentliche Fix
// gegen den "Architekturbüro statt Maklerei"-Eindruck: reale Objekte statt
// KI-Renderings, sobald welche erfasst sind.
const FALLBACK_IMAGE =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221242_dc36129e-cfa1-44b7-8b76-e01581d1c775.png";

const HUD_CORNERS = [
  "left-6 top-20 border-l border-t lg:left-10 lg:top-24",
  "right-6 top-20 border-r border-t lg:right-10 lg:top-24",
  "left-6 bottom-6 border-l border-b lg:left-10 lg:bottom-10",
  "right-6 bottom-6 border-r border-b lg:right-10 lg:bottom-10",
];

export function Hero() {
  const [heroImage, setHeroImage] = useState(FALLBACK_IMAGE);
  const [showIntro, setShowIntro] = useState(true);
  const [introStart, setIntroStart] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only media check, must run post-mount to stay hydration-safe
      setShowIntro(false);
      return;
    }
    // Wartet, bis der sitewide Loader fertig ist, damit die grosse
    // Schlüssel-Animation sichtbar von vorne beginnt statt verdeckt zu laufen.
    const timer = setTimeout(() => setIntroStart(true), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    async function loadLatestListingPhoto() {
      const { data } = await supabase!
        .from("listings")
        .select("listing_photos(url, sort_order)")
        .in("status", ["active", "reserved", "sold"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const photos = (data?.listing_photos as { url: string; sort_order: number }[] | null) ?? [];
      if (photos.length > 0) {
        const cover = [...photos].sort((a, b) => a.sort_order - b.sort_order)[0];
        setHeroImage(cover.url);
      }
    }

    loadLatestListingPhoto();
  }, []);

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink">
      {showIntro && <HeroKeyUnlock start={introStart} onDone={() => setShowIntro(false)} />}

      {/* Ruhiger Ken-Burns-Zoom auf dem Hintergrundfoto - läuft unabhängig vom Scroll,
          wirkt dadurch immer flüssig statt wie eingefrorene Zwischenbilder. */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
      >
        <Image
          src={heroImage}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          preload
          unoptimized
          className="object-cover"
        />
      </motion.div>

      {/* Blueprint-Raster + HUD-Ecken: rein dekorativ, kein Fortschritts-Narrativ mehr. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(95,184,232,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(95,184,232,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {HUD_CORNERS.map((pos) => (
          <div key={pos} className={`absolute h-9 w-9 border-blueprint/50 lg:h-12 lg:w-12 ${pos}`} />
        ))}
      </div>

      {/* Lesbarkeit + Stimmung */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_0%,rgba(10,13,18,0.9)_22%,rgba(10,13,18,0.55)_50%,rgba(10,13,18,0.25)_75%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-ink/50" />
      <div className="grain absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 py-32 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-10 lg:py-40">
        <div>
          <HeroHeadline text="Ihr Zuhause verdient den besten Preis." />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-6 max-w-xl text-balance text-lg text-ivory-dim lg:text-xl"
          >
            Gleiche Qualität wie grosse Makler — professionelle IAZI-Bewertung,
            Matterport-3D-Rundgang und persönliche Begleitung bis zum Notar.
            Zu <span className="font-mono text-amber-soft">0.95%</span> statt 3%.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8"
          >
            <a
              href="#kontakt"
              className="font-mono text-sm uppercase tracking-wide text-amber underline underline-offset-4 hover:text-amber-soft"
            >
              Oder direkt persönliches Gespräch vereinbaren →
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <ValuationWidget />
        </motion.div>
      </div>
    </section>
  );
}
