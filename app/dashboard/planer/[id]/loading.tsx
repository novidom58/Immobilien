/** Sofortige Rückmeldung, während Grundriss und gespeicherte Einrichtung laden. */
export default function PlanerLoading() {
  return (
    <main className="min-h-svh bg-ink px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-32 animate-pulse rounded bg-ink-3" />
        <div className="mt-6 h-9 w-2/3 animate-pulse rounded bg-ink-3" />
        <div className="mt-6 aspect-[4/3] w-full animate-pulse rounded-2xl border border-line bg-ink-2" />
        <p className="mt-4 text-center text-sm text-ivory-dim">Grundriss wird geladen …</p>
      </div>
    </main>
  );
}
