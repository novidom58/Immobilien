import Link from "next/link";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { OFFICES } from "@/lib/offices";
import { AREAS, areaHref } from "@/components/novidom360/areas";
import { Logo } from "@/components/ui/Logo";
import { SOCIAL_LINKS } from "@/lib/constants";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-ivory-dim sm:flex-row lg:px-10">
        <Logo className="h-10 w-auto" />
        <div className="flex flex-col gap-3 text-center sm:flex-row sm:gap-8 sm:text-left">
          {OFFICES.map((office) => (
            <address key={office.city} className="not-italic leading-snug">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-blueprint">{office.city}</span>
              {office.street}
              <br />
              {office.postalCode} {office.city}
            </address>
          ))}
        </div>
        <NewsletterSignup />
      </div>
      <nav aria-label="Leistungen" className="mx-auto mt-8 flex max-w-7xl flex-wrap justify-center gap-x-6 gap-y-2 px-6 text-sm lg:px-10">
        {AREAS.map((a) => (
          <Link key={a.id} href={areaHref(a.id)} className="text-ivory-dim hover:text-ivory">
            {a.title}
          </Link>
        ))}
      </nav>
      <div className="mx-auto mt-6 flex max-w-7xl justify-center gap-4 px-6 lg:px-10">
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ivory-dim transition-colors hover:border-amber hover:text-amber"
          >
            <InstagramIcon className="h-4 w-4" />
            {s.handle}
          </a>
        ))}
      </div>
      <div className="mx-auto mt-6 max-w-7xl px-6 text-center text-xs text-ivory-dim/40 lg:px-10">
        &copy; {new Date().getFullYear()} NoviDom Immo. Alle Rechte vorbehalten.
      </div>
      <div className="mx-auto mt-6 flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs sm:flex-row lg:px-10">
        <div className="flex gap-5 text-ivory-dim/50">
          <Link href="/datenschutz" className="hover:text-ivory-dim">
            Datenschutz
          </Link>
          <Link href="/impressum" className="hover:text-ivory-dim">
            Impressum
          </Link>
          <Link href="/admin/login" className="text-ivory-dim/30 hover:text-ivory-dim/60">
            Admin
          </Link>
        </div>
        <a href="#top" className="text-ivory-dim/50 hover:text-ivory-dim">
          Nach oben ↑
        </a>
      </div>
    </footer>
  );
}
