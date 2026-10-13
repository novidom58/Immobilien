"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/** Mobiler Aufruf am unteren Rand; verschwindet, solange der Funnel im Bild ist. */
export function MobileCta() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const target = document.getElementById("analyse");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      aria-hidden={hidden}
    >
      <a href="#analyse" tabIndex={hidden ? -1 : 0} className="flex items-center justify-center gap-2 rounded-lg bg-[#c0392b] py-3 font-semibold text-white">
        Kostenlose Analyse starten <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
