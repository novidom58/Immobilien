import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordFlow } from "@/components/ResetPasswordFlow";

export const metadata: Metadata = {
  title: "Neues Passwort setzen",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-6 py-20">
      <Link href="/" className="mb-10 font-display text-lg font-semibold tracking-tight text-ivory">
        Novi<span className="text-amber">Dom</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-center font-display text-2xl font-semibold text-ivory">
          Neues Passwort setzen
        </h1>
        <div className="mt-8">
          <ResetPasswordFlow />
        </div>
      </div>
    </main>
  );
}
