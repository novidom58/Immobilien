import Link from "next/link";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-ivory-dim sm:flex-row lg:px-10">
        <span className="font-display text-base font-semibold text-ivory">
          Novi<span className="text-amber">Dom</span> Immo
        </span>
        <span>Nordwestschweiz · CH</span>
        <NewsletterSignup />
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
