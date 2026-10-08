import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OFFICES } from "@/lib/offices";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 lg:px-10">
        <h1 className="font-display text-4xl font-semibold text-ivory">Impressum</h1>
        <p className="mt-4 text-sm text-ivory-dim/60">
          Entwurf — Firmierung und Handelsregister-/UID-Nummer folgen nach Gründung der
          Gesellschaft.
        </p>

        <div className="mt-10 flex flex-col gap-8 text-ivory-dim">
          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Anbieter</h2>
            <p className="mt-2">
              NoviDom Immo
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {OFFICES.map((office) => (
                <address key={office.city} className="not-italic">
                  Büro {office.city}
                  <br />
                  {office.street}
                  <br />
                  {office.postalCode} {office.city}, Schweiz
                </address>
              ))}
            </div>
            <p className="mt-3 text-sm text-ivory-dim/70">
              [Rechtsform und Handelsregister-/UID-Nummer werden nach Gründung der Gesellschaft
              ergänzt]
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Kontakt</h2>
            <p className="mt-2">Über das Kontaktformular auf dieser Website erreichbar.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Haftungsausschluss</h2>
            <p className="mt-2">
              Alle Angaben auf dieser Website erfolgen ohne Gewähr. Für die Richtigkeit,
              Vollständigkeit und Aktualität der bereitgestellten Informationen wird keine Haftung
              übernommen.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
