export type EmailTemplate = {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  follow_up_days: number | null;
};

export const TEMPLATE_CATEGORIES = ["Verkauf", "Kauf", "Finanzierung", "Umbau", "Versicherung", "Allgemein"];

export const PLACEHOLDERS = [
  { key: "vorname", label: "Vorname" },
  { key: "name", label: "Ganzer Name" },
  { key: "berater", label: "Berater" },
  { key: "objekt", label: "Objekt (Adresse)" },
  { key: "ort", label: "Ort" },
  { key: "datum", label: "Heutiges Datum" },
] as const;

export type TemplateContext = {
  name: string;
  berater?: string | null;
  objekt?: string | null;
  ort?: string | null;
};

/**
 * Ersetzt {vorname}, {berater} usw. Unbekannte oder leere Platzhalter
 * bleiben stehen, damit man vor dem Senden sieht, was noch fehlt.
 */
export function renderTemplate(text: string, ctx: TemplateContext) {
  const values: Record<string, string> = {
    vorname: ctx.name.trim().split(/\s+/)[0] ?? "",
    name: ctx.name.trim(),
    berater: ctx.berater?.trim() || "Ihr Team von NoviDom Immo",
    objekt: ctx.objekt?.trim() ?? "",
    ort: ctx.ort?.trim() ?? "",
    datum: new Date().toLocaleDateString("de-CH"),
  };
  return text.replace(/\{(\w+)\}/g, (match, key: string) => values[key.toLowerCase()] || match);
}

export function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  // Lokales Datum statt toISOString(), sonst springt es abends um einen Tag.
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const SIGNATURE = "\n\nFreundliche Grüsse\n{berater}\nNoviDom Immo";

/** Startpaket, das im Admin mit einem Klick angelegt werden kann. */
export const STARTER_TEMPLATES: Omit<EmailTemplate, "id">[] = [
  {
    category: "Verkauf",
    name: "Erstkontakt nach Bewertungsanfrage",
    subject: "Ihre Bewertungsanfrage bei NoviDom Immo",
    body: `Hallo {vorname}\n\nVielen Dank für Ihre Anfrage und Ihr Vertrauen. Damit wir Ihre Immobilie fundiert einschätzen können, würden wir sie gerne kurz vor Ort anschauen. Das dauert rund 30 Minuten und ist für Sie kostenlos und unverbindlich.\n\nPasst Ihnen ein Termin in den nächsten Tagen? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.${SIGNATURE}`,
    follow_up_days: 3,
  },
  {
    category: "Verkauf",
    name: "Nachfassen nach Bewertung",
    subject: "Ihre Immobilienbewertung: offene Fragen?",
    body: `Hallo {vorname}\n\nSie haben unsere Bewertung zu {objekt} nun schon ein paar Tage. Sind Fragen aufgetaucht, oder möchten Sie besprechen, wie ein Verkauf konkret ablaufen würde? Wir nehmen uns gerne Zeit für Sie.${SIGNATURE}`,
    follow_up_days: 5,
  },
  {
    category: "Verkauf",
    name: "Unterlagen für den Verkauf",
    subject: "Unterlagen für den Verkauf",
    body: `Hallo {vorname}\n\nDamit wir mit dem Verkauf weiterkommen, benötigen wir noch folgende Unterlagen:\n\n• Grundbuchauszug\n• Grundrisspläne\n• Gebäudeversicherungsausweis\n• Energieausweis (GEAK), falls vorhanden\n• Ausweiskopie\n\nSie können uns diese einfach per E-Mail zurücksenden. Vielen Dank!${SIGNATURE}`,
    follow_up_days: 7,
  },
  {
    category: "Verkauf",
    name: "Verkaufs-Update an Eigentümer",
    subject: "Update zum Verkauf: {objekt}",
    body: `Hallo {vorname}\n\nKurzes Update zum Verkauf Ihrer Immobilie:\n\n• Anfragen seit dem letzten Update: \n• Besichtigungen: \n• Rückmeldungen der Interessenten: \n\nUnsere Einschätzung und die nächsten Schritte besprechen wir gerne telefonisch.${SIGNATURE}`,
    follow_up_days: 14,
  },
  {
    category: "Kauf",
    name: "Besichtigung bestätigen",
    subject: "Bestätigung Ihrer Besichtigung",
    body: `Hallo {vorname}\n\nGerne bestätigen wir Ihre Besichtigung:\n\nObjekt: {objekt}\nDatum/Zeit: \nTreffpunkt: vor dem Hauseingang\n\nFalls etwas dazwischenkommt, geben Sie uns bitte kurz Bescheid.${SIGNATURE}`,
    follow_up_days: null,
  },
  {
    category: "Kauf",
    name: "Rückmeldung nach Besichtigung",
    subject: "Wie hat Ihnen {objekt} gefallen?",
    body: `Hallo {vorname}\n\nVielen Dank für Ihren Besuch. Wie hat Ihnen die Immobilie gefallen? Gibt es noch offene Fragen zum Objekt, zur Finanzierung oder zu möglichen Umbauten? Wir helfen Ihnen gerne weiter.${SIGNATURE}`,
    follow_up_days: 3,
  },
  {
    category: "Kauf",
    name: "Suchprofil bestätigt (Käufer-Alarm)",
    subject: "Ihr Suchprofil ist aktiv",
    body: `Hallo {vorname}\n\nWir haben Ihr Suchprofil erfasst. Sobald eine passende Immobilie auf den Markt kommt, melden wir uns bei Ihnen, oft schon bevor sie auf den Portalen erscheint.\n\nHat sich an Ihren Wünschen etwas geändert? Dann geben Sie uns einfach Bescheid.${SIGNATURE}`,
    follow_up_days: 30,
  },
  {
    category: "Finanzierung",
    name: "Hypotheken-Analyse: Unterlagen",
    subject: "Unterlagen für Ihre Hypotheken-Analyse",
    body: `Hallo {vorname}\n\nFür Ihre Hypotheken-Analyse benötigen wir folgende Unterlagen:\n\n• Aktueller Lohnausweis (bei Selbstständigen: letzte 3 Jahresabschlüsse)\n• Letzte Steuererklärung\n• Betreibungsauszug (nicht älter als 3 Monate)\n• Pensionskassenausweis\n• Nachweis der Eigenmittel\n• Objektunterlagen (Verkaufsdokumentation, Grundbuchauszug)\n\nSobald alles da ist, holen wir die Offerten bei verschiedenen Banken und Versicherungen ein.${SIGNATURE}`,
    follow_up_days: 5,
  },
  {
    category: "Finanzierung",
    name: "Hypotheken-Analyse: Offerten liegen vor",
    subject: "Ihre Hypothekar-Offerten liegen vor",
    body: `Hallo {vorname}\n\nDie Offerten für Ihre Finanzierung sind da. Wir haben sie verglichen und eine klare Empfehlung für Sie. Wann passt Ihnen ein kurzes Gespräch, damit wir die Varianten gemeinsam durchgehen?${SIGNATURE}`,
    follow_up_days: 3,
  },
  {
    category: "Finanzierung",
    name: "Hypothek läuft aus",
    subject: "Ihre Hypothek läuft bald aus",
    body: `Hallo {vorname}\n\nIhre Hypothek läuft in den nächsten Monaten aus. Jetzt ist ein guter Zeitpunkt, die Verlängerung zu prüfen und die Konditionen mehrerer Anbieter zu vergleichen. Sollen wir das für Sie übernehmen?${SIGNATURE}`,
    follow_up_days: 14,
  },
  {
    category: "Allgemein",
    name: "Kurzes Nachfassen",
    subject: "Kurzes Update zu Ihrem Anliegen",
    body: `Hallo {vorname}\n\nWir wollten kurz nachfragen, ob sich bei Ihnen in der Zwischenzeit etwas getan hat oder ob noch Fragen offen sind. Gerne melden wir uns auch telefonisch, wenn Ihnen das lieber ist.${SIGNATURE}`,
    follow_up_days: 7,
  },
  {
    category: "Allgemein",
    name: "Dank nach Abschluss",
    subject: "Herzlichen Dank, {vorname}",
    body: `Hallo {vorname}\n\nHerzlichen Dank für die angenehme Zusammenarbeit. Wenn Sie zufrieden waren, freuen wir uns sehr über eine kurze Google-Bewertung, das hilft uns enorm.\n\nUnd falls Sie in Zukunft Fragen zu Umbau, Finanzierung oder Versicherung haben: Wir sind weiterhin für Sie da.${SIGNATURE}`,
    follow_up_days: null,
  },
];
