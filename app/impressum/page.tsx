import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OFFICES } from "@/lib/offices";
import { OPERATOR, OPERATOR_PENDING } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 lg:px-10">
        <h1 className="font-display text-4xl text-ivory">Impressum</h1>

        <div className="mt-10 flex flex-col gap-8 text-ivory-dim">
          <section>
            <h2 className="font-display text-xl text-ivory">Betreiberin</h2>
            {OPERATOR.name ? (
              <>
                <p className="mt-2">
                  <span className="text-ivory">{OPERATOR.name}</span>
                  {OPERATOR.legalForm && ` (${OPERATOR.legalForm})`}
                  <br />
                  {OPERATOR.street}
                  <br />
                  {OPERATOR.postalCode} {OPERATOR.city}, Schweiz
                </p>
                {(OPERATOR.uid || OPERATOR.register) && (
                  <p className="mt-3">
                    {OPERATOR.uid && <>UID: {OPERATOR.uid}<br /></>}
                    {OPERATOR.register && <>Eingetragen im {OPERATOR.register}</>}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2">NoviDom Immo · {OPERATOR_PENDING}</p>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl text-ivory">Büros NoviDom Immo</h2>
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
          </section>

          <section>
            <h2 className="font-display text-xl text-ivory">Kontakt</h2>
            <p className="mt-2">
              {OPERATOR.phone && (
                <>
                  Telefon:{" "}
                  <a href={`tel:+41${OPERATOR.phone.replace(/\s/g, "").slice(1)}`} className="text-amber-soft underline underline-offset-4">
                    {OPERATOR.phone}
                  </a>
                  <br />
                </>
              )}
              E-Mail: <a href={`mailto:${OPERATOR.email}`} className="text-amber-soft underline underline-offset-4">{OPERATOR.email}</a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ivory">Haftungsausschluss</h2>
            <p className="mt-2">
              Die Inhalte dieser Website dienen ausschliesslich zu Informationszwecken und stellen keine rechtlich
              verbindliche Beratung dar. Angaben zu Preisen, Zinsen und Konditionen sind indikativ und können sich jederzeit
              ändern.
            </p>
            <p className="mt-2">
              Für die Richtigkeit, Vollständigkeit und Aktualität der Informationen wird keine Gewähr übernommen. Die
              Betreiberin haftet nicht für Schäden, die durch die Nutzung dieser Website entstehen. Für Inhalte verlinkter
              Websites sind ausschliesslich deren Betreiber verantwortlich.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
