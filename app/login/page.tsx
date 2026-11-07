import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { BellRing, Calculator, FileCheck2, LineChart, Ruler, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Kundenlogin",
  description: "Login zu Ihrem persönlichen Immobilienplan bei NoviDom Immobilien AG.",
  robots: { index: false, follow: false },
};

const FEATURES = [
  { icon: BellRing, title: "Käufer-Alarm", text: "Neue Objekte zu Ihrem Suchprofil, oft vor allen anderen." },
  { icon: Calculator, title: "Finanzierung", text: "Tragbarkeit sofort prüfen, Unterlagen sicher hochladen." },
  { icon: LineChart, title: "Verkauf live", text: "Anfragen, Besichtigungen und Feedback zu Ihrem Objekt." },
  { icon: ShieldCheck, title: "Versicherungen", text: "Alle Policen an einem Ort, mit Kündigungsfristen." },
  { icon: Ruler, title: "Grundriss-Planer", text: "Möbel massstabsgetreu im echten Grundriss platzieren." },
  { icon: FileCheck2, title: "Dokumente", text: "Verträge und Unterlagen jederzeit griffbereit." },
];

/**
 * Kundenlogin: links das Versprechen (was das Portal kann), rechts das
 * Formular. Auf dem Handy oben ein kompaktes Bild, darunter das Formular.
 */
export default function LoginPage() {
  return (
    <main className="grid min-h-svh bg-ink lg:grid-cols-[1.1fr_1fr]">
      {/* Bildseite */}
      <section className="relative isolate overflow-hidden bg-night">
        <Image
          src="/images/ki/hf_20260721_221242_dc36129e-cfa1-44b7-8b76-e01581d1c775.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="-z-10 object-cover opacity-70"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

        <div className="flex h-full flex-col justify-between gap-10 px-6 pb-8 pt-6 text-white lg:px-14 lg:py-12">
          <Link href="/" aria-label="NoviDom Startseite" className="w-fit rounded-xl bg-white/90 px-3 py-2 backdrop-blur-sm">
            <Logo className="h-8 w-auto lg:h-9" />
          </Link>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">Mein Immobilienplan</p>
            <h1 className="mt-3 max-w-xl text-balance font-display text-3xl leading-[1.05] sm:text-4xl lg:text-6xl">
              Ihr Zuhause. <em className="text-amber-soft">Alles an einem Ort.</em>
            </h1>
            <p className="mt-4 hidden max-w-md text-white/80 sm:block lg:text-lg">
              Kaufen, verkaufen, finanzieren und absichern: Sie sehen jederzeit, wo Sie stehen. Kostenlos und unverbindlich.
            </p>

            <ul className="mt-8 hidden max-w-2xl gap-3 sm:grid sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-md">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-[13px] leading-snug text-white/75">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-white/50">Bild: Visualisierung</p>
        </div>
      </section>

      {/* Formularseite */}
      <section className="flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <h2 className="font-display text-3xl text-ivory">Willkommen</h2>
          <p className="mt-2 text-sm text-ivory-dim">Melden Sie sich an oder erstellen Sie in einer Minute Ihr kostenloses Konto.</p>

          <div className="mt-8 rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)] sm:p-8">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Vorteile kompakt auf dem Handy */}
          <ul className="mt-8 grid grid-cols-2 gap-2 text-[13px] text-ivory-dim sm:hidden">
            {FEATURES.map(({ icon: Icon, title }) => (
              <li key={title} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
                <Icon className="h-4 w-4 text-amber" strokeWidth={1.6} />
                {title}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-ivory-dim">
            <Link href="/" className="hover:text-ivory">
              ← Zurück zur Startseite
            </Link>
            <span>
              Fragen?{" "}
              <Link href="/#kontakt" className="text-amber hover:underline">
                Schreiben Sie uns
              </Link>
            </span>
          </div>
          <Link href="/admin/login" className="mt-6 block text-center font-mono text-[10px] uppercase tracking-wide text-ivory-dim/40 hover:text-amber">
            Team-Login →
          </Link>
        </div>
      </section>
    </main>
  );
}
