"use client";

import { MapContainer, TileLayer, Marker, Tooltip, Popup, ZoomControl, AttributionControl } from "react-leaflet";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OFFICES, officeAddress } from "@/lib/offices";

const MAP_CENTER = { lat: 47.5596, lng: 7.5886 };

const markerIcon = L.divIcon({
  className: "",
  html: `<span class="relative flex h-4 w-4">
           <span class="absolute inline-flex h-full w-full animate-pulse-slow rounded-full bg-amber/40"></span>
           <span class="relative block h-4 w-4 rounded-full border-2 border-ink bg-amber shadow-[0_0_16px_3px_rgba(143,106,57,0.28)]"></span>
         </span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function CoverageMap() {
  return (
    <MapContainer
      center={[MAP_CENTER.lat, MAP_CENTER.lng]}
      zoom={13}
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
      {OFFICES.map((office) => (
        <Marker key={office.city} position={[office.lat, office.lng]} icon={markerIcon}>
          <Tooltip permanent direction="top" offset={[0, -10]} className="coverage-map-label">
            {office.label}
          </Tooltip>
          <Popup className="coverage-map-popup">
            <div className="min-w-[180px]">
              <div className="font-medium">{office.label}</div>
              <p className="mt-1 text-xs opacity-70">{officeAddress(office)}</p>
              <p className="mt-1 text-xs opacity-80">Unser Büro in {office.city}: persönliche Beratung vor Ort.</p>
              <Link href="/#kontakt" className="mt-2 inline-block text-xs font-medium underline underline-offset-2">
                Kontakt aufnehmen →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
