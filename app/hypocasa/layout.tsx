import type { Metadata, Viewport } from "next";
import { HYPOCASA_URL } from "@/lib/hypocasa";

// Eigener Auftritt für HypoCasa: über hypocasa.ch erreichbar (Rewrite in
// proxy.ts). data-site blendet die NoviDom-Elemente des Root-Layouts aus.

const title = "HypoCasa — Die beste Hypothek aus über 50 Angeboten";
const description =
  "Unabhängige Hypothekenberatung: über 50 Banken, Versicherungen und Pensionskassen im Vergleich, Finanzierungsbestätigung innert 24 Stunden. Persönlich und kostenlos.";

export const metadata: Metadata = {
  metadataBase: new URL(HYPOCASA_URL),
  title: { absolute: title },
  description,
  applicationName: "HypoCasa",
  appleWebApp: { capable: true, title: "HypoCasa", statusBarStyle: "default" },
  authors: [{ name: "HypoCasa" }],
  keywords: ["Hypothek", "Hypothekenvergleich", "Hypothek verlängern", "Hypothek aufstocken", "SARON", "Finanzierungsbestätigung", "PK-Vorbezug", "Säule 3a"],
  openGraph: { type: "website", locale: "de_CH", url: HYPOCASA_URL, siteName: "HypoCasa", title, description },
  twitter: { card: "summary", title, description },
  alternates: { canonical: HYPOCASA_URL },
};

export const viewport: Viewport = {
  themeColor: "#c0392b",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "HypoCasa",
  description,
  url: HYPOCASA_URL,
  areaServed: { "@type": "Country", name: "Schweiz" },
  priceRange: "kostenlos",
  knowsAbout: ["Hypotheken", "SARON-Hypothek", "Festhypothek", "Pensionskassen-Vorbezug", "Säule 3a"],
};

export default function HypoCasaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-site="hypocasa" className="min-h-svh bg-white font-sans text-slate-900 selection:bg-[#c0392b] selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </div>
  );
}
