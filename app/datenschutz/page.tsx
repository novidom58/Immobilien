import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 lg:px-10">
        <h1 className="font-display text-4xl font-semibold text-ivory">Datenschutzerklärung</h1>
        <p className="mt-4 text-sm text-ivory-dim/60">
          Entwurf — vor Veröffentlichung bitte von einer Fachperson prüfen lassen.
        </p>

        <div className="mt-10 flex flex-col gap-8 text-ivory-dim">
          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Verantwortliche Stelle</h2>
            <p className="mt-2">
              NoviDom Immo, Jana Schnuderl, Region Basel, Schweiz. Kontakt siehe{" "}
              <Link href="/#kontakt" className="text-amber-soft underline underline-offset-4">
                Kontaktformular
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Welche Daten wir erheben</h2>
            <p className="mt-2">
              Wenn Sie unser Kontakt- oder Bewertungsformular ausfüllen oder ein Kundenkonto
              erstellen, verarbeiten wir die von Ihnen angegebenen Daten (Name, E-Mail-Adresse,
              Telefonnummer, Nachricht) zur Bearbeitung Ihrer Anfrage bzw. zur Bereitstellung des
              Verkaufs-Cockpits.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Eingesetzte Dienstleister</h2>
            <p className="mt-2">
              Zur technischen Umsetzung nutzen wir Supabase (Datenspeicherung, Kundenlogin) und
              Resend (Zustellung von E-Mail-Benachrichtigungen). Beide Anbieter verarbeiten Daten
              in unserem Auftrag. Diese Website ist auf Vercel gehostet.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Cookies</h2>
            <p className="mt-2">
              Wir verwenden technisch notwendige Cookies für den Betrieb der Website (z. B. Ihre
              Anmeldesitzung) sowie ein Cookie zur Speicherung Ihrer Cookie-Auswahl. Weitere
              Cookies (z. B. für Statistik) werden nur mit Ihrer Einwilligung gesetzt.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Ihre Rechte</h2>
            <p className="mt-2">
              Sie können jederzeit Auskunft über Ihre gespeicherten Daten verlangen sowie deren
              Berichtigung oder Löschung. Kontaktieren Sie uns dazu über das{" "}
              <Link href="/#kontakt" className="text-amber-soft underline underline-offset-4">
                Kontaktformular
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
