import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OPERATOR } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Verantwortliche Stelle",
    body: [
      `${OPERATOR.name}, ${OPERATOR.street}, ${OPERATOR.postalCode} ${OPERATOR.city} (Betreiberin von NoviDom Immo). Kontakt: ${OPERATOR.email}`,
    ],
  },
  {
    title: "Welche Daten wir bearbeiten",
    body: [
      "Angaben, die Sie uns aktiv mitteilen, zum Beispiel Name, Kontaktdaten, Angaben zu Ihrer Immobilie, Ihrem Suchprofil oder Ihrem Finanzierungsvorhaben. Dazu kommen Daten aus Ihrem Kundenkonto, falls Sie das Kundenportal nutzen.",
      "Beim Besuch der Website fallen technische Daten an, zum Beispiel IP-Adresse, Browsertyp und Zugriffszeit.",
    ],
  },
  {
    title: "Zweck der Bearbeitung",
    body: [
      "Bearbeitung Ihrer Anfrage, Bewertung und Vermarktung Ihrer Immobilie, Vermittlung von Kaufinteressenten, Finanzierungen, Umbau- und Versicherungsleistungen sowie die Kommunikation mit Ihnen.",
      "Eine Weitergabe an Dritte, zum Beispiel an Banken, Versicherungen, Pensionskassen oder Fachpartner, erfolgt nur mit Ihrer Zustimmung oder soweit sie für die gewünschte Leistung nötig ist. Beim Käufer-Radar geben wir nur eine Anzahl passender Suchprofile bekannt, keine Personendaten.",
    ],
  },
  {
    title: "Eingesetzte Dienstleister",
    body: [
      "Hosting der Website: Vercel. Datenspeicherung und Kundenlogin: Supabase. Versand von E-Mails: Resend. Online-Terminbuchung: Cal.com (nur wenn Sie einen Termin buchen). Kartendarstellung: Esri/ArcGIS. Diese Anbieter bearbeiten Daten in unserem Auftrag und können Daten auch ausserhalb der Schweiz bearbeiten, zum Beispiel in der EU oder den USA. Wir achten auf angemessene vertragliche Garantien.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "Wir verwenden technisch notwendige Cookies für den Betrieb der Website, zum Beispiel für Ihre Anmeldung und Ihre Cookie-Auswahl. Weitere Cookies, etwa für Statistik, setzen wir nur mit Ihrer Einwilligung.",
    ],
  },
  {
    title: "Aufbewahrung",
    body: [
      "Wir bewahren Ihre Daten so lange auf, wie es für den Zweck nötig ist oder gesetzliche Aufbewahrungspflichten bestehen.",
    ],
  },
  {
    title: "Ihre Rechte",
    body: [
      "Gemäss dem Schweizer Datenschutzgesetz (DSG) haben Sie das Recht auf Auskunft, Berichtigung, Löschung und Herausgabe Ihrer Daten sowie das Recht, eine erteilte Einwilligung jederzeit zu widerrufen.",
      `Anfragen zum Datenschutz richten Sie bitte an ${OPERATOR.email}.`,
    ],
  },
];

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-32 lg:px-10">
        <h1 className="font-display text-4xl text-ivory">Datenschutzerklärung</h1>
        <div className="mt-10 flex flex-col gap-8 text-ivory-dim">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl text-ivory">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-2">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
