import type { AreaId } from "./areas";

/**
 * Verantwortliche Person pro Bereich. Foto als Datei unter public/team/
 * ablegen (z.B. public/team/kim.jpg) und hier als "/team/kim.jpg" eintragen.
 * Solange name leer ist, zeigt die Seite einen neutralen Team-Kontakt.
 */
export type AreaContact = {
  name: string;
  role: string;
  photo?: string;
  phone?: string;
  email?: string;
};

export const AREA_CONTACTS: Record<AreaId, AreaContact> = {
  kv: { name: "", role: "Kauf & Verkauf", email: "verkaufen@novidom-immo.ch" },
  fin: { name: "", role: "Finanzierung", email: "verkaufen@novidom-immo.ch" },
  umbau: { name: "", role: "Umbau & Renovation", email: "verkaufen@novidom-immo.ch" },
  vers: { name: "", role: "Versicherung", email: "verkaufen@novidom-immo.ch" },
};

export type AreaContent = {
  headline: string;
  accent: string;
  intro: string;
  image: string;
  benefits: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  cta: string;
  /** Kurze Vertrauenspunkte unter den Buttons */
  badges?: string[];
  /** Eigene Akzentfarbe für die Bereichsseite (z.B. HypoCasa-Rot) */
  accentColor?: string;
  /** Abschluss-Formular am Seitenende */
  closing: { title: string; text: string };
};

export const AREA_CONTENT: Record<AreaId, AreaContent> = {
  kv: {
    headline: "Verkaufen zum besten Preis.",
    accent: "Kaufen ohne Umwege.",
    intro:
      "Von der bankanerkannten Bewertung über die Vermarktung bis zum Notartermin: ein persönlicher Ansprechpartner, ein klarer Ablauf und eine faire Provision ab 0.95%.",
    image: "/images/novidom-holzhaus.webp",
    benefits: [
      { title: "Bankanerkannte Bewertung", text: "Marktwert nach IAZI- und WUP-Modell, abgeglichen mit aktuellen Transaktionspreisen in Ihrer Region." },
      { title: "Vermarktung, die auffällt", text: "Profi-Fotos, 360°-Rundgang, Grundrisse, eigene Objektseite und die passenden Portale." },
      { title: "Geprüfte Käufer", text: "Interessenten werden vor der Besichtigung auf ihre Finanzierbarkeit geprüft. Kein Zeitverlust." },
      { title: "Fair bezahlt", text: "Provision ab 0.95%, nur im Erfolgsfall. Kein Verkauf, keine Kosten." },
    ],
    faq: [
      { q: "Wie lange dauert ein Verkauf?", a: "Je nach Objekt und Lage meist zwei bis sechs Monate. Mit einer realistischen Bewertung und guter Vermarktung oft schneller." },
      { q: "Muss ich bei Besichtigungen dabei sein?", a: "Nein. Wir führen die Besichtigungen durch und berichten Ihnen danach persönlich." },
      { q: "Sehe ich, wo mein Verkauf steht?", a: "Ja. Im Kundenportal sehen Sie jederzeit den aktuellen Schritt, Anfragen und Besichtigungen." },
    ],
    cta: "Gratis-Bewertung anfragen",
    closing: { title: "Starten wir Ihren Verkauf.", text: "Ein persönliches Bewertungsgespräch mit unserem Team — unverbindlich und kostenlos." },
  },
  fin: {
    headline: "Ihre beste Hypothek.",
    accent: "Persönlich.",
    intro:
      "Mit unserem Partner HypoCasa vergleichen wir über 50 Banken, Versicherungen und Pensionskassen und finden die beste Lösung für Sie. Von der ersten Anfrage bis zum Notartermin. Persönlich, neutral und kostenlos.",
    badges: ["Bestätigung innert 24h", "50+ Anbieter", "Persönliche Beratung", "Kostenlos"],
    accentColor: "#c0392b",
    image: "/images/novidom-holzhaus.webp",
    benefits: [
      { title: "Viele Anbieter, ein Vergleich", text: "Statt bei jeder Bank einzeln anzufragen, holen wir die Offerten für Sie ein und vergleichen sie verständlich." },
      { title: "Tragbarkeit vorab geprüft", text: "Sie wissen vor der Besichtigung, was realistisch ist. Das stärkt Ihre Position beim Kauf." },
      { title: "Verlängerung im Blick", text: "Läuft Ihre Hypothek aus, melden wir uns rechtzeitig und prüfen bessere Konditionen." },
      { title: "Finanzierung für den Umbau", text: "Renovation oder energetische Sanierung? Wir klären, wie sich der Umbau finanzieren lässt." },
    ],
    faq: [
      { q: "Wie viel Eigenkapital brauche ich?", a: "In der Regel mindestens 20% des Kaufpreises. Davon müssen mindestens 10% aus «harten» Eigenmitteln stammen, also nicht aus der Pensionskasse." },
      { q: "Wie wird die Tragbarkeit berechnet?", a: "Banken rechnen mit einem kalkulatorischen Zins von rund 5% plus Nebenkosten und Amortisation. Diese Kosten sollten höchstens etwa einen Drittel des Bruttoeinkommens ausmachen." },
      { q: "Welche Unterlagen braucht es?", a: "Lohnausweis, Steuererklärung, Betreibungsauszug, Pensionskassenausweis, Nachweis der Eigenmittel und die Objektunterlagen. Wir sagen Ihnen genau, was fehlt." },
      { q: "Was bedeutet die Finanzierungsbestätigung innert 24h?", a: "Nach dem Erstgespräch und mit den nötigen Unterlagen erhalten Sie innert eines Werktages eine verbindliche Finanzierungsbestätigung. So können Sie sofort ein Angebot machen." },
      { q: "Was kostet die Beratung?", a: "Die Beratung ist für Sie kostenlos. HypoCasa wird von Banken und Versicherungen entschädigt, wenn erfolgreich vermittelt wird. Kein Abschluss, keine Kosten." },
      { q: "Was ist der SARON Alarm?", a: "Ein kostenloser Service für Kundinnen und Kunden: Wir beobachten den SARON und melden uns, wenn ein Wechsel, zum Beispiel zur Festhypothek, sinnvoll ist." },
      { q: "Helfen Sie auch bei Pensionskasse und 3. Säule?", a: "Ja. PK-Vorbezug oder Verpfändung, 3a-Optimierung und die steuerliche Planung koordinieren wir von Anfang an mit." },
    ],
    cta: "Kostenlose Beratung anfragen",
    closing: { title: "Klären wir Ihre Finanzierung.", text: "Ein kurzes Gespräch genügt für eine erste Einschätzung — unverbindlich und kostenlos." },
  },
  umbau: {
    headline: "Umbauen mit Plan.",
    accent: "Ein Ansprechpartner statt fünf Firmen.",
    intro:
      "Ob Küche, Bad, Dachausbau oder energetische Sanierung: Wir koordinieren geprüfte Fachpartner, behalten Budget und Termine im Blick und denken an den Wert Ihrer Immobilie.",
    image: "/images/novidom-holzhaus.webp",
    benefits: [
      { title: "Analyse vor Ort", text: "Wir schauen uns Ihr Zuhause an und zeigen, welche Massnahmen sich lohnen und welche nicht." },
      { title: "Geprüfte Fachpartner", text: "Handwerker und Planer aus unserem Netzwerk, mit vergleichbaren Offerten statt Überraschungen." },
      { title: "Wertsteigerung im Blick", text: "Wir wissen aus dem Verkauf, welche Umbauten sich später im Preis auszahlen." },
      { title: "Finanzierung inklusive", text: "Aufstockung der Hypothek oder Förderbeiträge für energetische Sanierungen klären wir gleich mit." },
    ],
    faq: [
      { q: "Lohnt sich ein Umbau vor dem Verkauf?", a: "Manchmal. Kleine Auffrischungen bringen oft mehr als grosse Umbauten. Wir rechnen es Ihnen vorher ehrlich durch." },
      { q: "Wer haftet für die Arbeiten?", a: "Die ausführenden Fachpartner. Wir koordinieren und achten auf saubere Offerten und Abnahmen." },
      { q: "Gibt es Förderbeiträge?", a: "Für energetische Sanierungen oft ja, je nach Kanton und Massnahme. Wir prüfen das im Rahmen der Planung." },
    ],
    cta: "Umbau-Beratung anfragen",
    closing: { title: "Planen wir Ihren Umbau.", text: "Erzählen Sie uns, was Sie vorhaben. Wir melden uns mit einer ersten Einschätzung." },
  },
  vers: {
    headline: "Rundum abgesichert.",
    accent: "Passend zu Ihrem Zuhause.",
    intro:
      "Beim Kauf, beim Umbau und im Besitz entstehen neue Risiken. Wir prüfen, was Ihr Zuhause wirklich braucht, und vermitteln an ausgewählte Partner. Ohne Standardpaket.",
    image: "/images/novidom-holzhaus.webp",
    benefits: [
      { title: "Gebäude & Naturgefahren", text: "Je nach Kanton über die Gebäudeversicherung geregelt. Wir zeigen, wo Lücken bestehen." },
      { title: "Hausrat & Haftpflicht", text: "Neu bewertet beim Umzug, damit die Versicherungssumme zum neuen Zuhause passt." },
      { title: "Bauzeit absichern", text: "Bauherrenhaftpflicht und Bauwesenversicherung beim Umbau, damit nichts an Ihnen hängen bleibt." },
      { title: "Rechtsschutz", text: "Für Streitigkeiten mit Handwerkern, Nachbarn oder beim Kaufvertrag." },
    ],
    faq: [
      { q: "Wann sollte ich meine Versicherungen prüfen?", a: "Beim Kauf, vor einem Umbau und bei jedem grösseren Lebensereignis. Spätestens alle paar Jahre lohnt sich ein Check." },
      { q: "Kostet die Beratung etwas?", a: "Die Erstberatung ist für Sie kostenlos und unverbindlich." },
      { q: "Muss ich meine bestehenden Policen kündigen?", a: "Nein. Wir prüfen zuerst, was Sie haben, und empfehlen nur Änderungen, die sich lohnen." },
    ],
    cta: "Versicherung besprechen",
    closing: { title: "Sichern wir Ihr Zuhause ab.", text: "Wir prüfen Ihre bestehenden Policen und zeigen, wo Lücken sind — unverbindlich und kostenlos." },
  },
};
