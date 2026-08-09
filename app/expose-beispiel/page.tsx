import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Beispiel-Exposé",
  robots: { index: false, follow: false },
};

// Bewusst helles "Papier"-Design: Diese Seite zeigt, wie das gedruckte /
// PDF-Exposé eines Objekts aussieht. Über den Browser-Druckdialog (Ctrl+P)
// lässt sie sich direkt als PDF speichern.
const HOUSE_IMG =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FpOaL3BYtZlQsCNldD74LxGPeN/hf_20260721_221242_dc36129e-cfa1-44b7-8b76-e01581d1c775.png";

const facts = [
  ["Objekttyp", "Einfamilienhaus"],
  ["Zimmer", "5.5"],
  ["Wohnfläche", "145 m²"],
  ["Grundstück", "420 m²"],
  ["Baujahr", "1998"],
  ["Etagen", "2 + ausgebautes UG"],
  ["Heizung", "Wärmepumpe (2021 ersetzt)"],
  ["Parkierung", "Doppelgarage + 2 Aussenplätze"],
];

const highlights = [
  "Ruhige, familienfreundliche Lage im Quartier",
  "2021 umfassend renoviert (Küche, Bad, Heizung)",
  "Grosszügiger Garten mit Abendsonne",
  "Schulen und ÖV in Gehdistanz",
];

export default function ExposeBeispielPage() {
  return (
    <main className="min-h-svh bg-[#eceae4] px-4 py-10 font-sans text-[#1c1a16] print:bg-white print:p-0">
      {/* Hinweisleiste - erscheint nicht im Druck */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between rounded-xl bg-[#1c1a16] px-5 py-3 text-sm text-white print:hidden">
        <span>
          <strong>Beispiel-Exposé</strong> — so sieht das Prospekt Ihres Objekts aus.
        </span>
        <span className="text-white/60">Mit Ctrl+P als PDF speichern</span>
      </div>

      {/* Das "Papier" */}
      <div className="mx-auto max-w-3xl bg-white shadow-xl print:shadow-none">
        {/* Kopf */}
        <div className="flex items-center justify-between px-10 pt-8">
          <span className="text-xl font-bold tracking-tight">
            Novi<span className="text-[#c07f2a]">Dom</span> Immo
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-[#8a8578]">
            Verkaufsdokumentation
          </span>
        </div>

        {/* Objektbild */}
        <div className="relative mx-10 mt-6 aspect-[16/9] overflow-hidden rounded-lg bg-[#eceae4]">
          <Image src={HOUSE_IMG} alt="Aussenansicht" fill sizes="768px" unoptimized className="object-cover" />
          <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-[10px] uppercase tracking-wide text-[#8a8578]">
            Beispielbild
          </span>
        </div>

        {/* Titel + Preis */}
        <div className="px-10 pt-8">
          <h1 className="text-3xl font-bold leading-tight">
            Charmantes Einfamilienhaus mit Garten
          </h1>
          <p className="mt-1 text-[#6b675c]">Musterstrasse 12 · 4053 Basel</p>
          <div className="mt-5 inline-block rounded-lg bg-[#f4efe6] px-5 py-3">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#a08752]">
              Verkaufspreis
            </span>
            <span className="text-2xl font-bold text-[#7c5a1e]">CHF 1&apos;200&apos;000</span>
          </div>
        </div>

        {/* Eckdaten + Highlights */}
        <div className="grid gap-10 px-10 pt-8 sm:grid-cols-2">
          <div>
            <h2 className="border-b border-[#e3ded2] pb-2 text-sm font-bold uppercase tracking-wide">
              Eckdaten
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-[#6b675c]">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="border-b border-[#e3ded2] pb-2 text-sm font-bold uppercase tracking-wide">
              Highlights
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="text-[#c07f2a]">✓</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <h2 className="mt-8 border-b border-[#e3ded2] pb-2 text-sm font-bold uppercase tracking-wide">
              Beschreibung
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4b473e]">
              An bevorzugter Lage im beliebten Gellert-Quartier steht dieses
              gepflegte Einfamilienhaus mit hellen Räumen, durchdachtem
              Grundriss und einem Garten, der zum Verweilen einlädt. Die
              umfassende Renovation von 2021 macht das Haus bezugsbereit —
              einziehen und wohlfühlen.
            </p>
          </div>
        </div>

        {/* Fusszeile */}
        <div className="mt-10 flex items-center justify-between border-t border-[#e3ded2] px-10 py-6 text-sm">
          <div>
            <div className="font-bold">Jana Schnuderl</div>
            <div className="text-[#6b675c]">NoviDom Immo · beratung@novidom-immo.ch</div>
          </div>
          <div className="text-right text-[#6b675c]">
            <div>3D-Rundgang &amp; weitere Bilder:</div>
            <div className="font-medium text-[#1c1a16]">www.novidom-immo.ch/immobilien</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl text-center print:hidden">
        <Link
          href="/dashboard"
          className="text-sm text-[#6b675c] underline underline-offset-4 hover:text-[#1c1a16]"
        >
          ← Zurück zum Verkaufs-Cockpit
        </Link>
      </div>
    </main>
  );
}
