"use client";

import { useEffect } from "react";

/**
 * Springt jemand per Link zu einem Bereich (#finanzierung, #policen …), der
 * unter «Weitere Bereiche» eingeklappt ist, wird er aufgeklappt und gezeigt.
 */
export function OpenSectionOnHash() {
  useEffect(() => {
    function open() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      const details = el?.closest("details");
      if (el && details && !details.open) {
        details.open = true;
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    }
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
