import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 text-center">
      <Link href="/" className="mb-8 font-display text-lg font-semibold tracking-tight text-ivory">
        Novi<span className="text-amber">Dom</span>
      </Link>
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-blueprint">404</span>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ivory">Seite nicht gefunden.</h1>
      <p className="mt-3 max-w-sm text-ivory-dim">
        Diese Seite existiert nicht mehr oder wurde verschoben.
      </p>
      <div className="mt-8 flex gap-6">
        <Link href="/" className="font-mono text-xs uppercase tracking-wide text-amber underline underline-offset-4">
          Zur Startseite
        </Link>
        <Link
          href="/immobilien"
          className="font-mono text-xs uppercase tracking-wide text-ivory-dim underline underline-offset-4 hover:text-ivory"
        >
          Alle Immobilien
        </Link>
      </div>
    </main>
  );
}
