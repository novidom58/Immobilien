import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/lib/providers/smooth-scroll";
import { Loader } from "@/components/Loader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { StickyContact } from "@/components/StickyContact";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";
import { OFFICES } from "@/lib/offices";

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-tech",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = "https://www.novidom-immo.ch";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  appleWebApp: { capable: true, title: "NoviDom", statusBarStyle: "default" },
  title: {
    default: "NoviDom Immo — Ihr Zuhause verdient den besten Preis",
    template: "%s | NoviDom Immo",
  },
  description:
    "NoviDom Immo verkauft Ihre Immobilie von der Nordwestschweiz bis zum Vierwaldstättersee transparent, schnell und persönlich — zur Provision ab 0.95%. Jetzt kostenlose Bewertung sichern.",
  keywords: [
    "Immobilienmakler Nordwestschweiz",
    "Immobilienmakler Basel",
    "Immobilienmakler Zürich",
    "Immobilienmakler Zug",
    "Immobilienmakler Luzern",
    "Immobilie verkaufen Basel",
    "Immobilienbewertung Basel",
    "faire Maklerkommission",
    "NoviDom Immo",
  ],
  authors: [{ name: "NoviDom Immo" }],
  openGraph: {
    type: "website",
    locale: "de_CH",
    url: siteUrl,
    siteName: "NoviDom Immo",
    title: "NoviDom Immo — Ihr Zuhause verdient den besten Preis",
    description:
      "Immobilien verkaufen von der Nordwestschweiz bis zum Vierwaldstättersee — transparent, persönlich, zur Provision ab 0.95%.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoviDom Immo — Ihr Zuhause verdient den besten Preis",
    description:
      "Immobilien verkaufen von der Nordwestschweiz bis zum Vierwaldstättersee — transparent, persönlich, zur Provision ab 0.95%.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  themeColor: "#faf9f6",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "NoviDom Immo",
  description:
    "Moderner Real-Estate-Partner für den Immobilienverkauf von der Nordwestschweiz bis zum Vierwaldstättersee mit einer Provision ab 0.95%.",
  url: siteUrl,
  areaServed: [
    { "@type": "Place", name: "Nordwestschweiz" },
    { "@type": "Place", name: "Kanton Aargau" },
    { "@type": "Place", name: "Kanton Solothurn" },
    { "@type": "Place", name: "Kanton Zürich" },
    { "@type": "Place", name: "Kanton Zug" },
    { "@type": "Place", name: "Kanton Luzern" },
  ],
  priceRange: "ab 0.95% Provision",
  email: "verkaufen@novidom-immo.ch",
  address: OFFICES.map((office) => ({
    "@type": "PostalAddress",
    streetAddress: office.street,
    postalCode: office.postalCode,
    addressLocality: office.city,
    addressCountry: "CH",
  })),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de-CH"
      className={`${serif.variable} ${inter.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full bg-ink text-ivory antialiased selection:bg-amber selection:text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        <Loader />
        <ScrollProgress />
        {children}
        <StickyContact />
        <CookieConsent />
      </body>
    </html>
  );
}
