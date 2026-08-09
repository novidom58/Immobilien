import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
          Entwurf — bitte exakte Firmierung, Adresse und ggf. Handelsregister-/UID-Nummer ergänzen.
        </p>

        <div className="mt-10 flex flex-col gap-8 text-ivory-dim">
          <section>
            <h2 className="font-display text-xl font-semibold text-ivory">Anbieter</h2>
            <p className="mt-2">
              NoviDom Immo
              <br />
              Jana Schnuderl
              <br />
              Region Basel, Schweiz
            </p>
            <p className="mt-2 text-sm text-ivory-dim/70">
              [Vollständige Geschäftsadresse und Kontaktangaben hier ergänzen]
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
