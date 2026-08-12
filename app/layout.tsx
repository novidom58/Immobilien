import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/lib/providers/smooth-scroll";
import { Loader } from "@/components/Loader";
import { ScrollProgress } from "@/components/ScrollProgress";
import { StickyContact } from "@/components/StickyContact";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
  title: {
    default: "NoviDom Immo — Ihr Zuhause verdient den besten Preis",
    template: "%s | NoviDom Immo",
  },
  description:
    "NoviDom Immo verkauft Ihre Immobilie in der Nordwestschweiz transparent, schnell und persönlich — zur fixen Kommission von 0.95%. Jetzt kostenlose Bewertung sichern.",
  keywords: [
    "Immobilienmakler Nordwestschweiz",
    "Immobilienmakler Basel",
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
      "Immobilien verkaufen in der Nordwestschweiz — transparent, persönlich, zur fixen Kommission von 0.95%.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoviDom Immo — Ihr Zuhause verdient den besten Preis",
    description:
      "Immobilien verkaufen in der Nordwestschweiz — transparent, persönlich, zur fixen Kommission von 0.95%.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  themeColor: "#0a0d12",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "NoviDom Immo",
  description:
    "Moderner Real-Estate-Partner für den Immobilienverkauf in der Nordwestschweiz mit fixer 0.95%-Kommission.",
  url: siteUrl,
  areaServed: {
    "@type": "Place",
    name: "Nordwestschweiz",
  },
  priceRange: "0.95% Kommission",
  founder: {
    "@type": "Person",
    name: "Jana Schnuderl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de-CH"
      className={`${spaceGrotesk.variable} ${inter.variable} ${mono.variable} h-full`}
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
