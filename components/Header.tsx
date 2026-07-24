"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#warum", label: "Warum NoviDom" },
  { href: "#prozess", label: "Prozess" },
  { href: "#kommission", label: "Kommission" },
  { href: "#ueber-uns", label: "Über uns" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
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
        <a
          href="#kontakt"
          className="rounded-full border border-amber/50 px-5 py-2 font-mono text-xs uppercase tracking-wider text-amber transition-colors hover:bg-amber hover:text-ink"
        >
          Bewertung sichern
        </a>
      </div>
    </header>
  );
}
