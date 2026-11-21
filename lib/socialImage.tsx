import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { faktenZeile, objektName, preisZeile, type SocialListing, type SocialVorlage } from "@/lib/socialPost";

// Instagram-Bild aus einem Inserat: echtes Objektfoto, dazu Eckdaten und Logo
// in ruhiger Gestaltung (Inter, wie auf der Website).

const AMBER = "#b8863b";
const INK = "#101418";

export async function socialImage(l: SocialListing, vorlage: SocialVorlage, foto: string | null, download = false) {
  const [regular, bold, logo] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/inter-latin-500-normal.woff")),
    readFile(join(process.cwd(), "assets/fonts/inter-latin-800-normal.woff")),
    readFile(join(process.cwd(), "public/brand/novidom-logo.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const story = vorlage === "story";
  const width = 1080;
  const height = story ? 1920 : 1350;
  const miete = l.offer_type === "miete";
  const statusText = l.status === "sold" ? (miete ? "Vermietet" : "Verkauft") : l.status === "reserved" ? "Reserviert" : "Neu im Angebot";

  const photo = (h: number) =>
    foto ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={foto} width={width} height={h} style={{ width, height: h, objectFit: "cover" }} alt="" />
    ) : (
      <div style={{ width, height: h, background: "#d9d4ca", display: "flex" }} />
    );

  const label = (text: string, dark = false) => (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "14px 26px",
        borderRadius: 999,
        background: dark ? INK : "#ffffff",
        color: dark ? "#ffffff" : INK,
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {text}
    </div>
  );

  let body;
  if (vorlage === "fakten") {
    const items = [
      l.rooms ? { k: "Zimmer", v: String(l.rooms) } : null,
      l.living_area ? { k: "Wohnfläche", v: `${l.living_area} m²` } : null,
      { k: miete ? "Miete / Mt." : "Preis", v: l.price_chf ? preisZeile(l).replace(" / Monat", "") : "auf Anfrage" },
    ].filter(Boolean) as { k: string; v: string }[];
    body = (
      <div style={{ display: "flex", flexDirection: "column", width, height, background: INK }}>
        {photo(700)}
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 72px", flex: 1 }}>
          <div style={{ display: "flex", color: AMBER, fontSize: 30, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>{l.city}</div>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 64, fontWeight: 800, letterSpacing: -2, marginTop: 12, lineHeight: 1.05 }}>{objektName(l)}</div>
          <div style={{ display: "flex", gap: 24, marginTop: 48 }}>
            {items.map((i) => (
              <div key={i.k} style={{ display: "flex", flexDirection: "column", flex: i.v.length > 9 ? 1.7 : 1, borderTop: `4px solid ${AMBER}`, paddingTop: 20 }}>
                <div style={{ display: "flex", color: "#ffffff", fontSize: 46, fontWeight: 800, letterSpacing: -1 }}>{i.v}</div>
                <div style={{ display: "flex", color: "#aeb4bc", fontSize: 26, marginTop: 6 }}>{i.k}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", marginTop: "auto", color: "#aeb4bc", fontSize: 26 }}>novidom-immo.ch · Link in der Bio</div>
        </div>
      </div>
    );
  } else if (vorlage === "status") {
    body = (
      <div style={{ display: "flex", position: "relative", width, height }}>
        {photo(height)}
        <div style={{ position: "absolute", left: 0, top: 0, width, height, display: "flex", background: "linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.65) 100%)" }} />
        <div style={{ position: "absolute", left: 64, top: 64, display: "flex" }}>{label(statusText, l.status === "sold")}</div>
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, display: "flex", flexDirection: "column", color: "#ffffff" }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>{objektName(l)}</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 14 }}>{l.city}</div>
        </div>
        <div style={{ position: "absolute", left: 0, bottom: 0, width, height: 110, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 64px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={228} height={66} alt="" />
          <div style={{ display: "flex", fontSize: 26, color: "#5b636d" }}>novidom-immo.ch</div>
        </div>
      </div>
    );
  } else {
    // «neu» und «story»: Foto gross, unten weisses Band mit Name, Eckdaten, Preis und Logo
    const band = story ? 520 : 400;
    body = (
      <div style={{ display: "flex", flexDirection: "column", width, height, background: "#ffffff" }}>
        <div style={{ display: "flex", position: "relative", width, height: height - band }}>
          {photo(height - band)}
          <div style={{ position: "absolute", left: 56, top: story ? 120 : 56, display: "flex" }}>{label(statusText)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: story ? "64px 72px" : "48px 64px", flex: 1 }}>
          <div style={{ display: "flex", color: AMBER, fontSize: 28, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
            {miete ? "Zu vermieten" : "Zu verkaufen"} · {l.city}
          </div>
          <div style={{ display: "flex", color: INK, fontSize: story ? 72 : 62, fontWeight: 800, letterSpacing: -2, marginTop: 10, lineHeight: 1.05 }}>{objektName(l)}</div>
          <div style={{ display: "flex", color: "#5b636d", fontSize: 32, marginTop: 14 }}>
            {faktenZeile(l)} · {preisZeile(l)}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={207} height={60} alt="" />
            <div style={{ display: "flex", fontSize: 26, color: "#5b636d" }}>Link in der Bio</div>
          </div>
        </div>
      </div>
    );
  }

  return new ImageResponse(<div style={{ display: "flex", width, height, fontFamily: "Inter" }}>{body}</div>, {
    width,
    height,
    fonts: [
      { name: "Inter", data: regular, weight: 500, style: "normal" },
      { name: "Inter", data: bold, weight: 800, style: "normal" },
    ],
    headers: {
      "Cache-Control": "public, max-age=300",
      ...(download ? { "Content-Disposition": `attachment; filename="novidom-${l.city.toLowerCase()}-${vorlage}.png"` } : {}),
    },
  });
}
