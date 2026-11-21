// «Wo finde ich was?»: Wegweiser für CRM und Kundenportal. Neue Funktionen
// hier eintragen (und unter NEUIGKEITEN), dann findet sie das ganze Team.

export type Weg = {
  frage: string;
  wo: string;
  href: string;
  /** Suchbegriffe, die nicht im Text stehen */
  stichworte?: string;
  nurPartner?: boolean;
};

export type WegGruppe = { titel: string; wege: Weg[] };

export const CRM_WEGWEISER: WegGruppe[] = [
  {
    titel: "Jeden Tag",
    wege: [
      { frage: "Was steht heute an?", wo: "Heute: Termine, offene Leads, Wiedervorlagen. Dasselbe kommt um 7:30 per Mail.", href: "/admin", stichworte: "morgen mail agenda" },
      { frage: "Neue Anfrage von der Website bearbeiten", wo: "Leads: Status setzen, Kunde anlegen, Wiedervorlage.", href: "/admin/leads", stichworte: "anfrage kontakt formular" },
      { frage: "Wen muss ich anrufen oder anschreiben?", wo: "Nachfassen: Exposé-Anfragen, Besichtigungen und Kunden ohne Kontakt.", href: "/admin/nachfassen", stichworte: "follow up erinnerung" },
      { frage: "Termin oder Besichtigung eintragen", wo: "Kalender (gemeinsam mit dem Firmenkalender).", href: "/admin/kalender", stichworte: "besichtigung termin" },
      { frage: "Anfrage per Telefon oder persönlich", wo: "Lead erfassen.", href: "/admin/erfassen", stichworte: "telefon anruf" },
    ],
  },
  {
    titel: "Kunden",
    wege: [
      { frage: "Kunde suchen und Akte öffnen", wo: "Alle Kunden: Name, Ort oder Telefon eingeben, Zeile anklicken.", href: "/admin/kunden", stichworte: "akte suchen" },
      { frage: "Wiedervorlage oder Notiz zu einem Kunden", wo: "Alle Kunden: Kunde öffnen. Oben das Datumsfeld ist die Wiedervorlage, weiter unten Notizen und Verlauf.", href: "/admin/kunden", stichworte: "notiz erinnerung" },
      { frage: "Kunde von Hand erfassen", wo: "Kunde erfassen.", href: "/admin/kunde-erfassen" },
      { frage: "Nur HypoCasa-Kunden anzeigen", wo: "Alle Kunden: Filter «Nur HypoCasa». Anfragen von hypocasa.ch landen automatisch hier.", href: "/admin/kunden", stichworte: "hypocasa finanzierung versicherung" },
      { frage: "Doppelte Kunden zusammenführen", wo: "Alle Kunden: Hinweis oben, oder direkt «Doppelte Kunden».", href: "/admin/kunden/doppelte", stichworte: "duplikat merge", nurPartner: true },
      { frage: "Excel-Liste importieren (NoviDom oder HypoCasa)", wo: "Excel-Import. Bestehende E-Mails werden übersprungen.", href: "/admin/import", stichworte: "csv excel liste", nurPartner: true },
      { frage: "Hypotheken, die bald auslaufen", wo: "Hypothekenwächter.", href: "/admin/hypotheken", stichworte: "saron zins ablauf" },
      { frage: "Was sagen Besucher nach der Besichtigung?", wo: "Besichtigungsfeedback.", href: "/admin/feedback" },
    ],
  },
  {
    titel: "Objekte",
    wege: [
      { frage: "Neues Inserat erfassen", wo: "Alle Inserate: oben «Neues Inserat».", href: "/admin/inserate", stichworte: "objekt inserat" },
      { frage: "Fotos, Titelbild oder Grundriss hochladen", wo: "Alle Inserate: beim Objekt «Fotos & Titelbild».", href: "/admin/inserate", stichworte: "bilder grundriss" },
      { frage: "Exposé oder Datenblatt für die Bank", wo: "Alle Inserate: «Exposé ansehen» oder «Datenblatt für die Bank».", href: "/admin/inserate", stichworte: "pdf expose bank" },
      { frage: "Instagram- oder Facebook-Beitrag zu einem Objekt", wo: "Social Media: Vorlage wählen, Bild laden, Text kopieren.", href: "/admin/social", stichworte: "instagram facebook post story" },
      { frage: "Mandat läuft bald ab", wo: "Ablaufende Fristen (auch in der Morgenmail).", href: "/admin/fristen", stichworte: "frist ablauf verlängern" },
      { frage: "Alle Dokumente zu allen Objekten", wo: "Unterlagen.", href: "/admin/unterlagen", stichworte: "dokumente dossier" },
      { frage: "Eigentümer für einen Verkauf anschreiben", wo: "Akquise-E-Mail: Daten eintragen, Text ist fertig.", href: "/admin/akquise", stichworte: "akquise mandat brief" },
    ],
  },
  {
    titel: "Geld und Team",
    wege: [
      { frage: "Abschluss und Provision eintragen, Bringer wählen", wo: "Alle Inserate: beim Objekt «Abschluss & Provision».", href: "/admin/inserate", stichworte: "verkauft provision bringer", nurPartner: true },
      { frage: "Wer bekommt wie viel?", wo: "Provisionen: Aufteilung und Rechner.", href: "/admin/provisionen", stichworte: "aufteilung courtage prozent" },
      { frage: "Mein Guthaben, Hypothek melden", wo: "Karriere.", href: "/admin/karriere", stichworte: "guthaben stufe melden" },
      { frage: "Meldungen der Mitarbeitenden prüfen", wo: "Karriere: «Zur Prüfung» (Zahl im Menü).", href: "/admin/karriere", stichworte: "bestätigen prüfen", nurPartner: true },
      { frage: "Woher kommen die Anfragen?", wo: "Was bringt was.", href: "/admin/kanaele", stichworte: "quelle statistik", nurPartner: true },
      { frage: "Zahlen der Firma", wo: "Dashboard.", href: "/admin/dashboard", stichworte: "umsatz statistik", nurPartner: true },
      { frage: "Mitarbeitende und Berater verwalten", wo: "Mitarbeitende und Berater.", href: "/admin/mitarbeiter", stichworte: "login rolle", nurPartner: true },
      { frage: "Mailtexte anpassen", wo: "Mailvorlagen.", href: "/admin/mailvorlagen", nurPartner: true },
      { frage: "Newsletter-Anmeldungen", wo: "Newsletter.", href: "/admin/newsletter", nurPartner: true },
    ],
  },
];

/** Neue Funktionen fürs Team, neueste zuerst. */
export const NEUIGKEITEN: { datum: string; text: string; href?: string }[] = [
  { datum: "2026-11-21", text: "Wegweiser: diese Seite. Suchen statt suchen.", href: "/admin/hilfe" },
  { datum: "2026-11-21", text: "Social Media: Für jedes Objekt fertige Instagram-Bilder und Texte.", href: "/admin/social" },
  { datum: "2026-11-21", text: "Morgenmail: neu mit ablaufenden Mandaten und «Social-Media-Beitrag bereit».", href: "/admin" },
  { datum: "2026-11-21", text: "HypoCasa-Anfragen landen im gleichen CRM, Filter «Nur HypoCasa».", href: "/admin/kunden" },
  { datum: "2026-11-21", text: "Doppelte Kunden finden und zusammenführen.", href: "/admin/kunden/doppelte" },
  { datum: "2026-11-20", text: "Bringer (20 %) beim Abschluss wählen; Meldungen der Mitarbeitenden prüfen.", href: "/admin/karriere" },
  { datum: "2026-11-20", text: "Provisionen: Aufteilung und Rechner.", href: "/admin/provisionen" },
];

/** Kurzer Wegweiser im Kundenportal. */
export const PORTAL_WEGWEISER: { frage: string; antwort: string }[] = [
  { frage: "Wo sehe ich passende Objekte?", antwort: "Unter «Passende Objekte». Mit dem Suchprofil sehen Sie neue Objekte zuerst, oft vor den Portalen." },
  { frage: "Wie richte ich eine Wohnung ein?", antwort: "Im «Grundriss-Planer»: Favorit mit Grundriss wählen und Möbel massstabsgetreu platzieren." },
  { frage: "Kann ich mir das leisten?", antwort: "Unter «Finanzierung»: Kaufkraft prüfen und Unterlagen für die Bank hochladen. HypoCasa prüft verbindlich." },
  { frage: "Wie läuft mein Verkauf?", antwort: "Im Verkaufs-Cockpit oben: Schritte, Anfragen, Besichtigungen und Dokumente." },
  { frage: "Was ist meine Immobilie wert?", antwort: "Unter «Mein Eigentum» mit dem Wertmonitor. Wir melden uns, wenn sich etwas lohnt." },
  { frage: "Ein Bereich fehlt oben?", antwort: "Unten bei «Weitere Bereiche» aufklappen, oder in der Übersicht mit + anheften." },
];
