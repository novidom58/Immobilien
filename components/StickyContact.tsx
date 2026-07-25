"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function StickyContact() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href="/#kontakt"
      aria-label="Kontakt aufnehmen"
      className={`fixed bottom-28 right-6 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-amber text-ink shadow-[0_0_30px_-6px_rgba(232,168,85,0.7)] transition-all duration-300 hover:shadow-[0_0_40px_-4px_rgba(232,168,85,0.9)] sm:bottom-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
    </Link>
  );
}
