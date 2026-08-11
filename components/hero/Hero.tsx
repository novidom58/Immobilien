"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { motion } from "motion/react";
import { HeroHeadline } from "./HeroHeadline";
import { MagneticButton } from "@/components/ui/MagneticButton";

// Nano Banana 2 keyframes: blueprint -> rohbau -> fertig (unbeleuchtet) -> fertig (beleuchtet).
// Gehostet auf der Higgsfield-CDN - vor dem finalen Launch idealerweise auf eigenen
// Storage/CDN umziehen, siehe Projekt-Notizen.
const frames = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221150_fa74846e-daa4-4137-84c2-ad0e20cace00.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221205_b6c6a47e-25be-48f6-9962-fbea46912246.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221235_bd637878-578d-4c53-902b-01006d1aa395.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221242_dc36129e-cfa1-44b7-8b76-e01581d1c775.png",
];

const HUD_CORNERS = [
  "left-6 top-20 border-l border-t lg:left-10 lg:top-24",
  "right-6 top-20 border-r border-t lg:right-10 lg:top-24",
  "left-6 bottom-6 border-l border-b lg:left-10 lg:bottom-10",
  "right-6 bottom-6 border-r border-b lg:right-10 lg:bottom-10",
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const framesWrapRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Reduced motion: skip the pinned scrub, show the finished house.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const last = frameRefs.current[frames.length - 1];
      if (last) {
        last.style.opacity = "1";
        last.style.clipPath = "none";
      }
      if (gridRef.current) gridRef.current.style.opacity = "0";
      if (hudRef.current) hudRef.current.style.opacity = "0";
      if (scanRef.current) scanRef.current.style.opacity = "0";
      if (labelRef.current) labelRef.current.textContent = "Verkaufsbereit";
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=200%",
          pin: true,
          // Smoothing lets the build glide behind the scroll instead of
          // snapping with it.
          scrub: 1.2,
          onUpdate: (self) => {
            if (labelRef.current) {
              const pct = Math.round(self.progress * 100);
              labelRef.current.textContent =
                pct < 100 ? `Analyse ${pct}%` : "Verkaufsbereit";
            }
          },
        },
      });

      const CLOSED = "inset(100% 0% 0% 0%)";
      const OPEN = "inset(0% 0% 0% 0%)";

      // Slow settle-zoom across the whole scrub for depth.
      tl.fromTo(
        framesWrapRef.current,
        { scale: 1.12 },
        { scale: 1, duration: 3.3, ease: "none" },
        0
      );

      // The house BUILDS: rohbau and fertig grow upward from the ground
      // (clip-path reveal) instead of crossfading - only the final lighting
      // state fades in over the finished structure.
      tl.fromTo(
        frameRefs.current[1],
        { clipPath: CLOSED },
        { clipPath: OPEN, duration: 1.05, ease: "power1.inOut" },
        0
      );
      tl.fromTo(
        frameRefs.current[2],
        { clipPath: CLOSED },
        { clipPath: OPEN, duration: 1.15, ease: "power1.inOut", immediateRender: false },
        1.05
      );
      tl.to(
        frameRefs.current[3],
        { opacity: 1, duration: 1.0, ease: "power1.inOut" },
        2.3
      );

      // Scan line rides the build edge: two upward passes, one per stage.
      tl.fromTo(
        scanRef.current,
        { top: "100%" },
        { top: "0%", duration: 1.05, ease: "power1.inOut" },
        0
      );
      tl.fromTo(
        scanRef.current,
        { top: "100%" },
        { top: "0%", duration: 1.15, ease: "power1.inOut", immediateRender: false },
        1.05
      );
      tl.to(scanRef.current, { opacity: 0, duration: 0.25, ease: "none" }, 2.25);

      // Blueprint grid dissolves as the build becomes real.
      tl.to(gridRef.current, { opacity: 0, duration: 1.8, ease: "power1.out" }, 0.5);

      // HUD frame retires once the house is finished.
      tl.to(hudRef.current, { opacity: 0, duration: 0.4, ease: "power1.out" }, 2.9);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink"
    >
      {/* Scroll-scrubbed photo frames */}
      <div
        ref={framesWrapRef}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,#1a2130_0%,#0a0d12_65%)]"
      >
        {frames.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              frameRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={
              i === 0
                ? undefined
                : i === frames.length - 1
                  ? { opacity: 0 }
                  : { clipPath: "inset(100% 0% 0% 0%)" }
            }
          >
            <Image
              src={src}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              preload={i === 0}
              unoptimized
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Blueprint grid overlay */}
      <div
        ref={gridRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.45,
          backgroundImage:
            "linear-gradient(rgba(95,184,232,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(95,184,232,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Scan line */}
      <div
        ref={scanRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-px bg-blueprint shadow-[0_0_24px_4px_rgba(95,184,232,0.65)]"
        style={{ top: "0%" }}
      />

      {/* HUD corners + valuation readout */}
      <div ref={hudRef} aria-hidden className="pointer-events-none absolute inset-0">
        {HUD_CORNERS.map((pos) => (
          <div
            key={pos}
            className={`absolute h-9 w-9 border-blueprint/60 lg:h-12 lg:w-12 ${pos}`}
          />
        ))}
        <span
          ref={labelRef}
          className="absolute right-6 top-20 mt-14 font-mono text-[10px] uppercase tracking-[0.3em] text-blueprint lg:right-10 lg:top-24"
        >
          Analyse 0%
        </span>
      </div>

      {/* Legibility + mood gradients so copy stays readable over the photo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink)_0%,rgba(10,13,18,0.92)_28%,rgba(10,13,18,0.5)_55%,rgba(10,13,18,0.15)_80%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-ink/35" />
      <div className="grain absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-40 lg:px-10 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber/40 bg-ink/40 px-4 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-soft">
            Persönliche Beratung · Region Basel
          </span>
        </motion.div>

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
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <MagneticButton href="#kontakt">
            Jetzt kostenlose Bewertung sichern
          </MagneticButton>
          <span className="font-sans text-sm text-ivory-dim">
            Unverbindlich &amp; kostenlos
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 lg:bottom-10"
      >
        <div className="flex flex-col items-center gap-2 text-ivory-dim">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
            Scrollen &amp; entdecken
          </span>
          <span className="h-9 w-px animate-pulse-slow bg-ivory-dim" />
        </div>
      </motion.div>
    </section>
  );
}
