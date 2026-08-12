import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(ellipse at 30% 20%, #1a2130 0%, #0a0d12 65%)",
          color: "#f4f1ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
          Novi<span style={{ color: "#e8a855" }}>Dom</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Ihr Zuhause verdient den besten Preis.
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 30, color: "#f2c177" }}>
          Immobilien verkaufen in der Nordwestschweiz · Fixe 0.95% Kommission
        </div>
      </div>
    ),
    { ...size }
  );
}
