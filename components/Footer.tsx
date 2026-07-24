export function Footer() {
  return (
    <footer className="border-t border-line bg-ink py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-ivory-dim sm:flex-row lg:px-10">
        <span className="font-display text-base font-semibold text-ivory">
          Novi<span className="text-amber">Dom</span> Immo
        </span>
        <span>Region Basel · CH</span>
        <span>&copy; {new Date().getFullYear()} NoviDom Immo. Alle Rechte vorbehalten.</span>
      </div>
    </footer>
  );
}
