import Image from "next/image";

// Lichtflecken auf den Fenstern, in Prozent des runden Ausschnitts
const GLOWS = [
  { x: 50, y: 46, r: 30 },
  { x: 54, y: 72, r: 30 },
  { x: 80, y: 52, r: 14 },
  { x: 12, y: 34, r: 14 },
];
const STARS = [
  [18, 10],
  [32, 5],
  [62, 8],
  [78, 14],
  [88, 6],
  [45, 15],
  [8, 20],
];

/**
 * Das Haus im Puzzle-Zentrum im Tageslauf: Sonne über den Himmel, am Abend
 * gehen die Lichter an, nachts Sterne. Reine CSS-Animation auf dem Foto;
 * ohne Bewegung (prefers-reduced-motion) bleibt die Abendstimmung stehen.
 */
export function DayNightHouse({ zoomed }: { zoomed: boolean }) {
  const anim = (name: string) => ({ animation: `${name} 16s ease-in-out infinite` });
  return (
    <div className={`absolute inset-0 transition-transform duration-700 ${zoomed ? "scale-110" : "scale-100"}`}>
      <Image src="/images/novidom-holzhaus.webp" alt="" fill sizes="(min-width: 768px) 300px, 42vw" className="object-cover" />
      <div className="motion-reduce:hidden">
        {/* Tag: heller Himmel, Licht wäscht die Abendfarben aus */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 mix-blend-screen"
          style={{ ...anim("nd-day"), background: "linear-gradient(to bottom, rgba(150,200,245,0.85), rgba(255,244,214,0.45) 55%, rgba(255,255,255,0.15))" }}
        />
        {/* Sonne auf einem Bogen über dem Dach */}
        <div aria-hidden className="absolute inset-0 opacity-0" style={{ ...anim("nd-sun"), transformOrigin: "50% 80%" }}>
          <span className="absolute left-1/2 top-[14%] h-[6%] w-[6%] -translate-x-1/2 rounded-full bg-[#fff3c4] shadow-[0_0_24px_10px_rgba(255,214,120,0.75)]" />
        </div>
        {/* Nacht: dunkelblau, die Fenster leuchten stärker */}
        <div aria-hidden className="absolute inset-0 opacity-0 mix-blend-multiply" style={{ ...anim("nd-night"), background: "linear-gradient(to bottom, #0b1630, #1d2b4f 60%, #2a3350)" }} />
        <div aria-hidden className="absolute inset-0 opacity-0 mix-blend-screen" style={anim("nd-glow")}>
          {GLOWS.map((g) => (
            <span
              key={`${g.x}-${g.y}`}
              className="absolute rounded-full"
              style={{
                left: `${g.x - g.r / 2}%`,
                top: `${g.y - g.r / 2}%`,
                width: `${g.r}%`,
                height: `${g.r}%`,
                background: "radial-gradient(circle, rgba(255,190,90,0.5), rgba(255,160,60,0) 65%)",
              }}
            />
          ))}
        </div>
        <div aria-hidden className="absolute inset-0 opacity-0" style={anim("nd-stars")}>
          {STARS.map(([x, y]) => (
            <span key={`${x}-${y}`} className="absolute h-[2px] w-[2px] rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
