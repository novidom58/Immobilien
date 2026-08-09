"use client";

import { motion } from "motion/react";
import Image from "next/image";

// Nano Banana 2 keyframes: blueprint -> rohbau -> fertig (unbeleuchtet) -> fertig (beleuchtet).
// Gehostet auf der Higgsfield-CDN - vor dem finalen Launch idealerweise auf eigenen
// Storage/CDN umziehen, siehe Projekt-Notizen.
const frames = [
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221150_fa74846e-daa4-4137-84c2-ad0e20cace00.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221205_b6c6a47e-25be-48f6-9962-fbea46912246.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221235_bd637878-578d-4c53-902b-01006d1aa395.png",
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221242_dc36129e-cfa1-44b7-8b76-e01581d1c775.png",
];

const STEP = 1.35;

export function HeroPhotoSequence() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#1a2130_0%,#0a0d12_65%)]"
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
    >
      {frames.map((src, i) => {
        const isLast = i === frames.length - 1;
        return (
          // Animation lives on this plain wrapper div, never on next/image
          // itself - next/image's `fill` mode owns its own layout styles
          // (data-nimg="fill"), and letting Framer Motion write competing
          // inline styles onto that same element is a fragile pattern that
          // can silently break the image layout.
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={{ opacity: i === 0 ? 1 : 0, scale: 1.06 }}
            animate={{
              opacity: [i === 0 ? 1 : 0, 1, isLast ? 1 : 0],
              scale: isLast ? 1.12 : 1.06,
            }}
            transition={{
              opacity: {
                delay: i * STEP,
                duration: isLast ? 1 : STEP,
                times: isLast ? undefined : [0, 0.35, 1],
                ease: "easeInOut",
              },
              scale: {
                delay: i * STEP,
                duration: isLast ? 14 : STEP,
                ease: isLast ? "linear" : "easeOut",
              },
            }}
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
          </motion.div>
        );
      })}
    </motion.div>
  );
}
