import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Kundenlogin",
  description: "Login zu Ihrem persönlichen Immobilienplan bei NoviDom Immo.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 py-20">
      <Link
        href="/"
        className="mb-10"
      >
        <Logo className="h-12 w-auto" />
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-2xl font-semibold text-ivory">
          Kundenlogin
        </h1>
        <p className="mt-2 text-center text-sm text-ivory-dim">
          Ihr Immobilienplan: Suchprofil, Finanzierung, Versicherung und Ihr Verkauf.
        </p>

        <div className="mt-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <Link
          href="/"
          className="mt-8 block text-center font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
        >
          ← Zurück zur Startseite
        </Link>

        <Link
          href="/admin/login"
          className="mt-3 block text-center font-mono text-xs uppercase tracking-wide text-ivory-dim/40 hover:text-amber"
        >
          Admin-Login →
        </Link>
      </div>
    </main>
  );
}
