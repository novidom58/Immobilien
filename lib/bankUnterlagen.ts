// Unterlagen für die Finanzierung, je nach Einkommen, Objekt und Vorhaben.
// Gleiche Logik im Kundenportal (Checkliste mit Upload) und im CRM
// (Anforderungstext zum Kopieren).

import type { ChecklistItem } from "@/components/DocChecklist";

export type Erwerb = "angestellt" | "selbstaendig" | "pensioniert";
export type Objekt = "normal" | "stwe" | "rendite";
export type Vorhaben = "kauf" | "abloesung";
export type ObjektDocs = "einzeln" | "makler";

export const ERWERB_OPTIONS: { value: Erwerb; label: string }[] = [
  { value: "angestellt", label: "Angestellt" },
  { value: "selbstaendig", label: "Selbständig" },
  { value: "pensioniert", label: "Pensioniert" },
];
export const OBJEKT_OPTIONS: { value: Objekt; label: string }[] = [
  { value: "normal", label: "Einfamilienhaus / Wohnung" },
  { value: "stwe", label: "Stockwerkeigentum" },
  { value: "rendite", label: "Renditeobjekt" },
];
export const VORHABEN_OPTIONS: { value: Vorhaben; label: string }[] = [
  { value: "kauf", label: "Kauf" },
  { value: "abloesung", label: "Bestehende Hypothek ablösen / verlängern" },
];
export const OBJEKT_DOCS_OPTIONS: { value: ObjektDocs; label: string }[] = [
  { value: "einzeln", label: "Einzeln auflisten" },
  { value: "makler", label: "Kommen von NoviDom (unser Objekt)" },
];

export type BankInput = { erwerb: Erwerb; objekt: Objekt; vorhaben: Vorhaben; objektDocs?: ObjektDocs; jahr?: number };

/** Liefert die Unterlagen in zwei Gruppen: persönlich und zur Liegenschaft. */
export function bankUnterlagen({ erwerb, objekt, vorhaben, objektDocs = "einzeln", jahr = new Date().getFullYear() - 1 }: BankInput) {
  const personal: ChecklistItem[] = [{ key: "Steuererklärung", label: `Steuererklärung ${jahr} (eingereichte Version)` }];
  if (erwerb === "angestellt") {
    personal.push(
      { key: "Lohnausweis", label: `Lohnausweis ${jahr}` },
      { key: "Lohnabrechnungen", label: "Letzte 3 Lohnabrechnungen" },
      { key: "Pensionskasse", label: "Aktueller Pensionskassenausweis" }
    );
  } else if (erwerb === "selbstaendig") {
    personal.push(
      { key: "Jahresabschlüsse", label: "Letzte 3 Jahresabschlüsse" },
      { key: "Pensionskasse", label: "Aktueller Pensionskassenausweis (sofern vorhanden)" }
    );
  } else {
    personal.push(
      { key: "AHV-Rente", label: "AHV-Rentenbescheinigung" },
      { key: "PK-Rente", label: "Pensionskassen-Rentenbescheinigung" }
    );
  }
  if (vorhaben === "kauf") personal.push({ key: "Eigenmittel", label: "Nachweis der Eigenmittel (Kontoauszug, Säule-3a-Guthaben, Vorbezug o. Ä.)" });
  else personal.push({ key: "Hypothekarvertrag", label: "Kopie des aktuellen Hypothekarvertrags" });

  let property: ChecklistItem[];
  if (objektDocs === "makler") {
    property = [{ key: "Objekt", label: "Objektunterlagen stellt NoviDom direkt der Bank zu" }];
  } else {
    property = [
      { key: "Fotos", label: "Fotos der Liegenschaft (innen und aussen)" },
      { key: "Grundbuchauszug", label: "Aktueller Grundbuchauszug" },
      { key: "Gebäudeversicherung", label: "Gebäudeversicherungsausweis" },
      { key: "Grundriss", label: "Grundrisspläne" },
    ];
    if (objekt === "stwe") property.push({ key: "STWE-Reglement", label: "Stockwerkeigentumsreglement" });
    if (objekt === "rendite") property.push({ key: "Mieterspiegel", label: "Mieterspiegel inklusive Nettomieten" });
    if (vorhaben === "kauf") property.push({ key: "Kaufvertrag", label: "Verkaufsdokumentation oder Kaufvertragsentwurf, sofern vorhanden" });
  }
  return { personal, property };
}

/** Text zum Anfordern per Mail (CRM). */
export function bankUnterlagenText(input: BankInput) {
  const { personal, property } = bankUnterlagen(input);
  return [
    "Damit wir gezielt bei Banken, Versicherungen und Pensionskassen anfragen können, brauchen wir folgende Dokumente:",
    "",
    "PERSÖNLICHE UNTERLAGEN",
    ...personal.map((i) => `• ${i.label}`),
    "",
    "UNTERLAGEN ZUR LIEGENSCHAFT",
    ...property.map((i) => `• ${i.label}`),
    "",
    "Sie können alles bequem im Kundenportal unter «Finanzierung» hochladen.",
  ].join("\n");
}
