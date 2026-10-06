import type { CSSProperties } from "react";

/**
 * Vektor-Haus im Bauplan-Stil. `stage` steuert per CSS (globals.css,
 * `.bp-house[data-stage]`), welche Ebene sichtbar ist:
 * 0 Ausgangslage · 1 Bewertung · 2 Verkauf · 3 Umbau · 4 Finanzierung ·
 * 5 Versicherung · 6 fertiges Zuhause.
 */
export function BlueprintHouse({ stage, label = "Haus als Bauplan" }: { stage: number; label?: string }) {
  const delay = (i: number) => ({ "--bp-delay": `${i * 0.18}s` }) as CSSProperties;

  return (
    <svg
      className="bp-house h-full w-full overflow-visible"
      viewBox="0 0 400 320"
      data-stage={stage}
      role="img"
      aria-label={label}
    >
      <g className="bp-base">
        <path className="bp-draw" pathLength={1} style={delay(0)} d="M16 284H384" />
        <path className="bp-draw" pathLength={1} style={delay(1)} d="M90 284V152H310V284" />
        <path className="bp-draw" pathLength={1} style={delay(2)} d="M68 152 200 62 332 152" />
        <path className="bp-draw" pathLength={1} style={delay(3)} d="M262 108V80H284V124" />
        <path className="bp-draw" pathLength={1} style={delay(4)} d="M185 284V214H221V284" />
        <circle className="bp-draw" pathLength={1} style={delay(4)} cx="214" cy="250" r="2" />
        <rect className="bp-draw" pathLength={1} style={delay(5)} x="112" y="176" width="50" height="44" />
        <rect className="bp-draw" pathLength={1} style={delay(5)} x="238" y="176" width="50" height="44" />
        <circle className="bp-draw" pathLength={1} style={delay(6)} cx="200" cy="118" r="14" />
        <path
          className="bp-thin bp-draw"
          pathLength={1}
          style={delay(6)}
          d="M137 176V220M112 198H162M263 176V220M238 198H288M200 104V132M186 118H214"
        />
        <path className="bp-thin bp-draw" pathLength={1} style={delay(7)} d="M90 152H310M120 284V152M280 284V152" />
      </g>

      <g>
        <rect className="bp-glow" x="113" y="177" width="48" height="42" />
        <rect className="bp-glow" x="239" y="177" width="48" height="42" />
        <circle className="bp-glow" cx="200" cy="118" r="13" />
      </g>

      <g className="bp-g bp-value">
        <path d="M46 62V284M40 62H52M40 284H52" />
        <rect className="bp-scan" x="90" y="60" width="220" height="2" />
        <g transform="translate(222 20)">
          <rect width="148" height="26" rx="13" />
          <text className="bp-text" x="74" y="17" textAnchor="middle">
            MARKTWERT ERMITTELT
          </text>
        </g>
      </g>

      <g className="bp-g bp-sale">
        <path d="M350 284V196" />
        <rect x="318" y="196" width="64" height="32" rx="4" />
        <text className="bp-text" x="350" y="216" textAnchor="middle">
          VERKAUFT
        </text>
        <g transform="translate(173 186) scale(.55)">
          <circle cx="8.2" cy="15.8" r="3.4" />
          <path d="M10.5 13.4 18.5 5.4" />
          <path d="m15.2 8.7 2.1 2.1" />
          <path d="m17.6 6.3 2.1 2.1" />
        </g>
      </g>

      <g className="bp-g bp-reno">
        <path d="M60 284V112M96 284V150M60 152H96M60 196H96M60 240H96M60 152 96 196M60 196 96 240" />
        <path d="M304 284V150M340 284V112M304 152H340M304 196H340M304 240H340M304 196 340 152M304 240 340 196" />
        <g className="bp-solid" transform="translate(150 12) scale(1.5)">
          <path d="m14.2 7.2 2.6 2.6" />
          <path d="M3.5 20.5 10 14" />
          <path d="M14.2 7.2a3 3 0 0 1 4.24 0l1.06 1.06a3 3 0 0 1 0 4.25L18 14 9.8 5.8l1.56-1.56a3 3 0 0 1 2.84-.8Z" />
        </g>
      </g>

      <g className="bp-g bp-fin">
        <ellipse cx="352" cy="276" rx="24" ry="7" />
        <ellipse cx="352" cy="266" rx="24" ry="7" />
        <ellipse cx="352" cy="256" rx="24" ry="7" />
        <g transform="translate(20 22)">
          <rect width="104" height="26" rx="13" />
          <text className="bp-text" x="52" y="17" textAnchor="middle">
            FINANZIERT
          </text>
        </g>
      </g>

      <g className="bp-g bp-ins">
        <path className="bp-shield" d="M200 10 356 54V170C356 232 292 276 200 306 108 276 44 232 44 170V54Z" />
        <path d="m184 36 12 12 22-24" />
      </g>
    </svg>
  );
}
