"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LogIn, Menu, X } from "lucide-react";

const links = [
  { href: "#warum", label: "Warum NoviDom" },
  { href: "#prozess", label: "Prozess" },
  { href: "#kommission", label: "Kommission" },
  { href: "#ueber-uns", label: "Über uns" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen
          ? "border-b border-line bg-ink/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="font-display text-lg font-semibold tracking-tight text-ivory">
          Novi<span className="text-amber">Dom</span>
        </a>
        <nav className="hidden items-center gap-8 font-sans text-sm text-ivory-dim md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ivory"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="hidden items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-ivory-dim transition-colors hover:text-ivory sm:flex"
          >
            <LogIn className="h-3.5 w-3.5" strokeWidth={1.5} />
            Kundenlogin
          </a>
          <a
            href="#kontakt"
            className="hidden rounded-full border border-amber/50 px-5 py-2 font-mono text-xs uppercase tracking-wider text-amber transition-colors hover:bg-amber hover:text-ink sm:block"
          >
            Bewertung sichern
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Menü schliessen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center text-ivory md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-ink md:hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-6">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-2 py-3 font-sans text-base text-ivory-dim transition-colors hover:bg-ink-2 hover:text-ivory"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-lg px-2 py-3 font-mono text-xs uppercase tracking-wider text-ivory-dim hover:bg-ink-2 hover:text-ivory"
              >
                <LogIn className="h-3.5 w-3.5" strokeWidth={1.5} />
                Kundenlogin
              </a>
              <a
                href="#kontakt"
                onClick={() => setMobileOpen(false)}
                className="mt-3 rounded-full bg-amber px-5 py-3 text-center font-mono text-xs uppercase tracking-wider text-ink"
              >
                Bewertung sichern
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
