// Sterne im oberen Bilddrittel, in Prozent
const STARS = [
  [8, 9],
  [17, 4],
  [29, 12],
  [41, 6],
  [55, 3],
  [63, 11],
  [72, 5],
  [84, 9],
  [93, 4],
];

/**
 * Tageslauf über dem Hero-Foto: Tag, goldenes Abendlicht, Nacht mit
 * Sternen, Morgenrot. Gedacht für Tagesaufnahmen; die Farben liegen per
 * Blend-Mode über dem Bild. Ohne Bewegung (prefers-reduced-motion) bleibt
 * das Foto unverändert.
 */
export function DayNightOverlay() {
  const anim = (name: string) => ({ animation: `${name} 16s ease-in-out infinite` });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      {/* Sonne auf einem Bogen über das Bild */}
      <div className="absolute inset-0" style={{ ...anim("nd-sun"), transformOrigin: "50% 150%" }}>
        <span className="absolute left-1/2 top-[7%] h-6 w-6 -translate-x-1/2 rounded-full bg-[#fff6d2] shadow-[0_0_40px_18px_rgba(255,220,140,0.7)] sm:h-8 sm:w-8" />
      </div>
      <div
        className="absolute inset-0 opacity-0 mix-blend-multiply"
        style={{ ...anim("nd-warm"), background: "linear-gradient(to bottom, rgba(255,150,80,0.75), rgba(255,190,130,0.45) 60%, rgba(255,210,170,0.3))" }}
      />
      <div
        className="absolute inset-0 opacity-0 mix-blend-multiply"
        style={{ ...anim("nd-night"), background: "linear-gradient(to bottom, #0a1430, #1a2a52 55%, #2b3558)" }}
      />
      <div className="absolute inset-0 opacity-0" style={anim("nd-stars")}>
        {STARS.map(([x, y]) => (
          <span key={`${x}-${y}`} className="absolute h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </div>
      <div
        className="absolute inset-0 opacity-0 mix-blend-multiply"
        style={{ ...anim("nd-dawn"), background: "linear-gradient(to bottom, rgba(255,170,190,0.7), rgba(255,215,200,0.35) 60%, transparent)" }}
      />
    </div>
  );
}
