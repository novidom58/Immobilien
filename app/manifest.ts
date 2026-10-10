import type { MetadataRoute } from "next";

// Macht die Webseite auf dem Handy installierbar («Zum Home-Bildschirm»).
// Das App-Symbol öffnet direkt «Mein Immobilienplan» im Kundenportal.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NoviDom Immobilien & Beratung",
    short_name: "NoviDom",
    description: "Suchprofil, Finanzierung, Versicherung und Ihr Verkauf an einem Ort.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#faf9f6",
    lang: "de-CH",
    icons: [
      { src: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
