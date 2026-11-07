"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const COOKIE = "portal_offen";
const MAX = 3;

function read() {
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  return raw ? decodeURIComponent(raw.split("=")[1]).split(",").filter(Boolean) : [];
}

function write(keys: string[]) {
  document.cookie = `${COOKIE}=${encodeURIComponent(keys.slice(0, MAX).join(","))}; path=/dashboard; max-age=31536000; samesite=lax`;
}

/**
 * Merkt sich, welche Bereiche unter «Weitere Bereiche» aufgeklappt wurden.
 * Beim nächsten Besuch stehen sie offen oben, ohne erneutes Scrollen.
 */
export function RememberOpenSections() {
  useEffect(() => {
    function onToggle(e: Event) {
      const el = e.target as HTMLElement;
      if (!(el instanceof HTMLDetailsElement) || !el.id.startsWith("mehr-")) return;
      const key = el.id.slice(5);
      const rest = read().filter((k) => k !== key);
      write(el.open ? [key, ...rest] : rest);
    }
    // «toggle» steigt nicht auf, darum in der Capture-Phase hören
    document.addEventListener("toggle", onToggle, true);
    return () => document.removeEventListener("toggle", onToggle, true);
  }, []);
  return null;
}

/** Gemerkten Bereich wieder nach unten zu «Weitere Bereiche» legen. */
export function CollapseRemembered({ section }: { section: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        write(read().filter((k) => k !== section));
        router.refresh();
      }}
      className="text-xs text-ivory-dim underline underline-offset-4 hover:text-ivory"
    >
      Wieder einklappen
    </button>
  );
}
