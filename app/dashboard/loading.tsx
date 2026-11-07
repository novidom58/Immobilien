import { Logo } from "@/components/ui/Logo";

/** Sofort sichtbar, während das Portal die persönlichen Daten lädt. */
export default function DashboardLoading() {
  return (
    <main className="min-h-svh bg-ink px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Logo className="h-9 w-auto" />
        <div className="mt-14 h-10 w-72 animate-pulse rounded-lg bg-ink-3" />
        <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-ink-3" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-white" />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-ivory-dim">Ihr Immobilienplan wird geladen …</p>
      </div>
    </main>
  );
}
