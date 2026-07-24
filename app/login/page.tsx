import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Kundenlogin",
  description: "Login zum persönlichen Verkaufs-Cockpit von NoviDom Immo.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 py-20">
      <Link
        href="/"
        className="mb-10 font-display text-lg font-semibold tracking-tight text-ivory"
      >
        Novi<span className="text-amber">Dom</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-2xl font-semibold text-ivory">
          Kundenlogin
        </h1>
        <p className="mt-2 text-center text-sm text-ivory-dim">
          Zugang zu Ihrem persönlichen Verkaufs-Cockpit.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>

        <Link
          href="/"
          className="mt-8 block text-center font-mono text-xs uppercase tracking-wide text-ivory-dim/60 hover:text-ivory"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
