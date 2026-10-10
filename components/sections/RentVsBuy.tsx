"use client";

import { useEffect, useId, useRef, useState } from "react";
import { chf, monthlyOwnerCost, rentVsBuy, type RentVsBuyInput } from "@/lib/ownership";

// Validierte Serienfarben (Lightness, Chroma, CVD-Abstand, Kontrast geprüft)
const BUY = "#b5701c";
const RENT = "#2a78d6";

const PAD_WIDE = { top: 16, right: 76, bottom: 30, left: 56 };
const PAD_NARROW = { top: 16, right: 60, bottom: 30, left: 44 };

function short(v: number) {
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)} Mio.`;
  return `${sign}${Math.round(abs / 1000)}k`;
}

/** Runde Achsenschritte (1, 2, 2.5, 5 × 10^n). */
function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3 text-sm text-ivory">
        {label}
        <span className="font-semibold tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-amber)]"
      />
    </label>
  );
}

/** Mieten oder kaufen? Monatliche Kosten heute und Vermögen nach X Jahren. */
export function RentVsBuy() {
  const [price, setPrice] = useState(1_200_000);
  const [rent, setRent] = useState(3_200);
  const [equity, setEquity] = useState(20);
  const [rate, setRate] = useState(1.5);
  const [appreciation, setAppreciation] = useState(1.5);
  const [years, setYears] = useState(10);
  const [rentIncrease, setRentIncrease] = useState(1);
  const [investReturn, setInvestReturn] = useState(3);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const [W, setW] = useState(640);

  // Das SVG zeichnet in echten Pixeln der Breite, damit die Schrift am Handy lesbar bleibt.
  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 480 ? 240 : 280;
  const PAD = W < 480 ? PAD_NARROW : PAD_WIDE;
  const titleId = useId();

  const input: RentVsBuyInput = {
    price,
    equityShare: equity / 100,
    rate: rate / 100,
    rent,
    years,
    appreciation: appreciation / 100,
    rentIncrease: rentIncrease / 100,
    investReturn: investReturn / 100,
    buyingCosts: 0.02,
  };
  const rows = rentVsBuy(input);
  const owner = monthlyOwnerCost(price, equity / 100, rate / 100);
  const last = rows[rows.length - 1];
  const advantage = last.buyWealth - last.rentWealth;
  const breakEven = rows.find((r) => r.year > 0 && r.buyWealth >= r.rentWealth)?.year ?? null;

  // Skalen
  const values = rows.flatMap((r) => [r.buyWealth, r.rentWealth]);
  const step = niceStep((Math.max(...values) - Math.min(0, ...values)) / 4);
  const yMax = Math.ceil(Math.max(...values) / step) * step;
  const yMin = Math.floor(Math.min(0, ...values) / step) * step;
  const x = (year: number) => PAD.left + (year / years) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
  const path = (key: "buyWealth" | "rentWealth") => rows.map((r, i) => `${i ? "L" : "M"}${x(r.year).toFixed(1)},${y(r[key]).toFixed(1)}`).join("");
  const ticks = Array.from({ length: Math.round((yMax - yMin) / step) + 1 }, (_, i) => yMin + step * i);
  const xTicks = rows.filter((r) => r.year % (years > 15 ? 5 : years > 8 ? 2 : 1) === 0);

  // Direkte Endlabels ohne Überlappung
  let buyLabelY = y(last.buyWealth);
  let rentLabelY = y(last.rentWealth);
  if (Math.abs(buyLabelY - rentLabelY) < 18) {
    const mid = (buyLabelY + rentLabelY) / 2;
    const up = buyLabelY < rentLabelY ? -9 : 9;
    buyLabelY = mid + up;
    rentLabelY = mid - up;
  }

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const year = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * years);
    setHover(Math.max(0, Math.min(years, year)));
  }

  const hovered = hover !== null ? rows[hover] : null;

  return (
    <div className="grid gap-8 rounded-[28px] border border-line bg-white p-6 shadow-[0_15px_70px_rgba(61,53,34,0.06)] lg:grid-cols-[320px_1fr] lg:p-10">
      <div className="grid content-start gap-5">
        <Slider label="Kaufpreis" value={price} display={chf(price)} min={400_000} max={3_000_000} step={25_000} onChange={setPrice} />
        <Slider label="Vergleichbare Miete / Monat" value={rent} display={chf(rent)} min={1_200} max={9_000} step={50} onChange={setRent} />
        <Slider label="Eigenkapital" value={equity} display={`${equity}% · ${chf((price * equity) / 100)}`} min={20} max={60} step={5} onChange={setEquity} />
        <Slider label="Hypothekarzins" value={rate} display={`${rate.toFixed(1)}%`} min={0.8} max={4} step={0.1} onChange={setRate} />
        <Slider label="Wertsteigerung pro Jahr" value={appreciation} display={`${appreciation.toFixed(1)}%`} min={0} max={4} step={0.25} onChange={setAppreciation} />
        <Slider label="Zeitraum" value={years} display={`${years} Jahre`} min={5} max={25} step={1} onChange={setYears} />
        <details className="rounded-xl bg-ink-2 p-4 text-sm">
          <summary className="cursor-pointer text-ivory">Weitere Annahmen</summary>
          <div className="mt-4 grid gap-4">
            <Slider label="Mietsteigerung pro Jahr" value={rentIncrease} display={`${rentIncrease.toFixed(1)}%`} min={0} max={3} step={0.25} onChange={setRentIncrease} />
            <Slider label="Rendite auf angelegtes Geld" value={investReturn} display={`${investReturn.toFixed(1)}%`} min={0} max={6} step={0.25} onChange={setInvestReturn} />
            <p className="text-xs leading-relaxed text-ivory-dim">
              Fest eingerechnet: 2% Kaufnebenkosten, 1% Unterhalt und Nebenkosten pro Jahr, Amortisation der 2. Hypothek in 15 Jahren. Wer mietet, legt
              Eigenkapital und Ersparnis an. Steuern sind nicht berücksichtigt.
            </p>
          </div>
        </details>
      </div>

      <div className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-ink-2 p-4">
            <div className="text-xs text-ivory-dim">Kaufen pro Monat</div>
            <div className="mt-1 font-display text-2xl text-ivory tabular-nums">{chf(owner.total)}</div>
            <div className="mt-1 text-[11px] text-ivory-dim">davon {chf(owner.amortisation)} Amortisation (Sparen)</div>
          </div>
          <div className="rounded-2xl bg-ink-2 p-4">
            <div className="text-xs text-ivory-dim">Mieten pro Monat</div>
            <div className="mt-1 font-display text-2xl text-ivory tabular-nums">{chf(rent)}</div>
            <div className="mt-1 text-[11px] text-ivory-dim">Nettomiete heute</div>
          </div>
          <div className="rounded-2xl bg-night p-4 text-ink">
            <div className="text-xs text-ink/70">Nach {years} Jahren</div>
            <div className="mt-1 font-display text-2xl tabular-nums">{chf(Math.abs(advantage))}</div>
            <div className="mt-1 text-[11px] text-ink/70">mehr Vermögen mit {advantage >= 0 ? "Kaufen" : "Mieten"}</div>
          </div>
        </div>

        <figure ref={figureRef} className="relative mt-6">
          <figcaption id={titleId} className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold text-ivory">Vermögen über die Jahre</span>
            <span className="flex gap-4 text-xs text-ivory-dim">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-0.5 w-4 rounded" style={{ background: BUY }} />
                Kaufen
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="h-0.5 w-4 rounded" style={{ background: RENT }} />
                Mieten
              </span>
            </span>
          </figcaption>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-pan-y select-none"
            role="img"
            aria-labelledby={titleId}
            onPointerMove={handleMove}
            onPointerDown={handleMove}
            onPointerLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-line" strokeWidth={1} />
                <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-ivory-dim text-[11px] tabular-nums">
                  {short(t)}
                </text>
              </g>
            ))}
            {xTicks.map((r) => (
              <text key={r.year} x={x(r.year)} y={H - 8} textAnchor="middle" className="fill-ivory-dim text-[11px]">
                {r.year === 0 ? "heute" : `${r.year} J.`}
              </text>
            ))}
            <path d={path("rentWealth")} fill="none" stroke={RENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <path d={path("buyWealth")} fill="none" stroke={BUY} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            <text x={x(years) + 8} y={buyLabelY + 4} className="fill-ivory text-[12px] font-semibold">
              Kaufen
            </text>
            <text x={x(years) + 8} y={rentLabelY + 4} className="fill-ivory text-[12px] font-semibold">
              Mieten
            </text>
            {hovered && (
              <g>
                <line x1={x(hovered.year)} x2={x(hovered.year)} y1={PAD.top} y2={H - PAD.bottom} stroke="currentColor" className="text-ivory-dim" strokeWidth={1} />
                {(["rentWealth", "buyWealth"] as const).map((k) => (
                  <circle key={k} cx={x(hovered.year)} cy={y(hovered[k])} r={4.5} fill={k === "buyWealth" ? BUY : RENT} stroke="white" strokeWidth={2} />
                ))}
              </g>
            )}
          </svg>
          {hovered && (
            <div
              className="pointer-events-none absolute top-8 z-10 rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg"
              style={{ left: `clamp(0px, calc(${(x(hovered.year) / W) * 100}% - 70px), calc(100% - 150px))` }}
            >
              <div className="text-ivory-dim">{hovered.year === 0 ? "Heute" : `Nach ${hovered.year} Jahren`}</div>
              {(
                [
                  ["Kaufen", hovered.buyWealth, BUY],
                  ["Mieten", hovered.rentWealth, RENT],
                ] as const
              ).map(([label, v, color]) => (
                <div key={label} className="mt-1 flex items-center gap-2">
                  <span aria-hidden className="h-0.5 w-3 rounded" style={{ background: color }} />
                  <span className="font-semibold text-ivory tabular-nums">{chf(v)}</span>
                  <span className="text-ivory-dim">{label}</span>
                </div>
              ))}
            </div>
          )}
        </figure>

        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          {breakEven
            ? `Ab etwa Jahr ${breakEven} liegt Kaufen vorne. `
            : advantage < 0
              ? "Mit diesen Annahmen liegt Mieten im gewählten Zeitraum vorne. "
              : ""}
          Bisher ausgegeben (Geld, das weg ist): Kaufen {chf(last.buyCost)}, Mieten {chf(last.rentCost)}.
        </p>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-ivory underline underline-offset-4">Als Tabelle anzeigen</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="text-ivory-dim">
                <tr>
                  <th className="py-1.5 pr-3 font-normal">Jahr</th>
                  <th className="py-1.5 pr-3 font-normal">Vermögen Kaufen</th>
                  <th className="py-1.5 pr-3 font-normal">Vermögen Mieten</th>
                  <th className="py-1.5 font-normal">Differenz</th>
                </tr>
              </thead>
              <tbody className="text-ivory">
                {rows.map((r) => (
                  <tr key={r.year} className="border-t border-line">
                    <td className="py-1.5 pr-3">{r.year}</td>
                    <td className="py-1.5 pr-3">{chf(r.buyWealth)}</td>
                    <td className="py-1.5 pr-3">{chf(r.rentWealth)}</td>
                    <td className="py-1.5">{chf(r.buyWealth - r.rentWealth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
