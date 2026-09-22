"use client";

import { MapContainer, TileLayer, Marker, Polyline, Tooltip, ZoomControl, AttributionControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Place = {
  key: string;
  label: string;
  lat: number;
  lng: number;
  hub?: boolean;
};

const PLACES: Place[] = [
  { key: "basel", label: "Basel · Büro", lat: 47.5596, lng: 7.5886, hub: true },
  { key: "solothurn", label: "Solothurn", lat: 47.2088, lng: 7.5323 },
  { key: "aargau", label: "Aargau", lat: 47.3925, lng: 8.0442 },
  { key: "zuerich", label: "Zürich", lat: 47.3769, lng: 8.5417 },
  { key: "zug", label: "Zug · Büro", lat: 47.1662, lng: 8.5155, hub: true },
  { key: "luzern", label: "Luzern", lat: 47.0502, lng: 8.3093 },
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
        </Marker>
      ))}
    </MapContainer>
  );
}
