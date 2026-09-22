"use client";

import { MapContainer, TileLayer, Marker, Polyline, Tooltip, Popup, ZoomControl, AttributionControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Place = {
  key: string;
  label: string;
  lat: number;
  lng: number;
  hub?: boolean;
  address?: string;
  popupText: string;
  ctaHref: string;
  ctaLabel: string;
};

const PLACES: Place[] = [
  {
    key: "basel",
    label: "Basel · Büro",
    lat: 47.5596,
    lng: 7.5886,
    hub: true,
    address: "Güterstrasse 14, 4053 Basel (vorläufig — definitive Adresse folgt)",
    popupText: "Unser Büro in Basel — persönliche Beratung vor Ort.",
    ctaHref: "/#kontakt",
    ctaLabel: "Kontakt aufnehmen →",
  },
  {
    key: "solothurn",
    label: "Solothurn",
    lat: 47.2088,
    lng: 7.5323,
    popupText: "Aktiv im Kanton Solothurn.",
    ctaHref: "/#bewertung",
    ctaLabel: "Kostenlose Bewertung →",
  },
  {
    key: "aargau",
    label: "Aargau",
    lat: 47.3925,
    lng: 8.0442,
    popupText: "Aktiv im Kanton Aargau.",
    ctaHref: "/#bewertung",
    ctaLabel: "Kostenlose Bewertung →",
  },
  {
    key: "zuerich",
    label: "Zürich",
    lat: 47.3769,
    lng: 8.5417,
    popupText: "Aktiv im Kanton Zürich.",
    ctaHref: "/#bewertung",
    ctaLabel: "Kostenlose Bewertung →",
  },
  {
    key: "zug",
    label: "Zug · Büro",
    lat: 47.1662,
    lng: 8.5155,
    hub: true,
    address: "Baarerstrasse 12, 6300 Zug (vorläufig — definitive Adresse folgt)",
    popupText: "Unser Büro in Zug — persönliche Beratung vor Ort.",
    ctaHref: "/#kontakt",
    ctaLabel: "Kontakt aufnehmen →",
  },
  {
    key: "luzern",
    label: "Luzern",
    lat: 47.0502,
    lng: 8.3093,
    popupText: "Aktiv in der Region Luzern.",
    ctaHref: "/#bewertung",
    ctaLabel: "Kostenlose Bewertung →",
  },
];

const LINKS: [string, string][] = [
  ["basel", "solothurn"],
  ["basel", "aargau"],
  ["aargau", "zuerich"],
  ["aargau", "zug"],
  ["zug", "luzern"],
];

function place(key: string) {
  return PLACES.find((p) => p.key === key)!;
}

function markerIcon(hub: boolean) {
  return L.divIcon({
    className: "",
    html: hub
      ? `<span class="relative flex h-4 w-4">
           <span class="absolute inline-flex h-full w-full animate-pulse-slow rounded-full bg-amber/40"></span>
           <span class="relative block h-4 w-4 rounded-full border-2 border-ink bg-amber shadow-[0_0_16px_3px_rgba(232,168,85,0.6)]"></span>
         </span>`
      : `<span class="block h-2.5 w-2.5 rounded-full border-2 border-ink bg-amber-soft shadow-[0_0_8px_1px_rgba(242,193,119,0.5)]"></span>`,
    iconSize: hub ? [16, 16] : [10, 10],
    iconAnchor: hub ? [8, 8] : [5, 5],
  });
}

const bounds: [number, number][] = PLACES.map((p) => [p.lat, p.lng]);

export default function CoverageMap() {
  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [56, 56] }}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <ZoomControl position="bottomright" />
      <AttributionControl position="bottomleft" />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {LINKS.map(([a, b]) => {
        const from = place(a);
        const to = place(b);
        return (
          <Polyline
            key={`${a}-${b}`}
            positions={[
              [from.lat, from.lng],
              [to.lat, to.lng],
            ]}
            pathOptions={{ color: "#5fb8e8", weight: 1.5, opacity: 0.45, dashArray: "4 5" }}
          />
        );
      })}
      {PLACES.map((p) => (
        <Marker key={p.key} position={[p.lat, p.lng]} icon={markerIcon(!!p.hub)}>
          <Tooltip permanent direction="top" offset={[0, p.hub ? -10 : -7]} className="coverage-map-label">
            {p.label}
          </Tooltip>
          <Popup className="coverage-map-popup">
            <div className="min-w-[180px]">
              <div className="font-medium">{p.label}</div>
              {p.address && <p className="mt-1 text-xs opacity-70">{p.address}</p>}
              <p className="mt-1 text-xs opacity-80">{p.popupText}</p>
              <a
                href={p.ctaHref}
                className="mt-2 inline-block text-xs font-medium underline underline-offset-2"
              >
                {p.ctaLabel}
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
