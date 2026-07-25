"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "novidom-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("novidom-consent-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("novidom-consent-changed", callback);
  };
}
const getSnapshot = () => localStorage.getItem(STORAGE_KEY);
const getServerSnapshot = () => "pending";

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function decide(value: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, value);
    // storage events don't fire in the tab that wrote them, so signal
    // ourselves to re-check the external store and hide the banner.
    window.dispatchEvent(new Event("novidom-consent-changed"));
  }

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-ink-2/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ivory-dim">
          Wir verwenden nur technisch notwendige Cookies sowie — mit Ihrer
          Einwilligung — Cookies zur Verbesserung dieser Website. Details in
          unserer{" "}
          <Link href="/datenschutz" className="text-amber-soft underline underline-offset-4">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => decide("declined")}
            className="rounded-full border border-line px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ivory-dim hover:text-ivory"
          >
            Ablehnen
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="rounded-full bg-amber px-5 py-2.5 font-mono text-xs uppercase tracking-wide text-ink"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
