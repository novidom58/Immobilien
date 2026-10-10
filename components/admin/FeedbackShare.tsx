"use client";

import { useState } from "react";
import { MessageSquareHeart } from "lucide-react";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.novidom-immo.ch";

/** Feedback-Link nach der Besichtigung: per WhatsApp teilen oder für Instagram kopieren. */
export function FeedbackShare({ listingId, title }: { listingId: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const linkStyle = { background: "none", border: "none", color: "var(--blue)", cursor: "pointer", padding: 0 } as const;
  const text = (k: string) => `Danke für Ihren Besuch bei «${title}»! Wie hat es Ihnen gefallen? Eine Minute, ganz ohne Anruf: ${SITE}/feedback/${listingId}?k=${k}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text("instagram"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Text kopieren:", text("instagram"));
    }
  }

  return (
    <span className="flex items-center gap-1.5 td-light">
      <MessageSquareHeart className="h-3 w-3" strokeWidth={1.75} />
      Feedback:
      <a href={`https://wa.me/?text=${encodeURIComponent(text("whatsapp"))}`} target="_blank" rel="noreferrer" style={{ color: "var(--blue)" }}>
        WhatsApp
      </a>
      ·
      <button type="button" onClick={copy} style={linkStyle}>
        {copied ? "kopiert" : "für Instagram kopieren"}
      </button>
    </span>
  );
}
