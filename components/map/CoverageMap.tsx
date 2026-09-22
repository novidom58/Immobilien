"use client";

import { MapContainer, TileLayer, Marker, Tooltip, Popup, ZoomControl, AttributionControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BASEL = {
  label: "Basel · Büro",
  lat: 47.5596,
  lng: 7.5886,
  address: "Güterstrasse 14, 4053 Basel (vorläufig — definitive Adresse folgt)",
  popupText: "Unser Büro in Basel — persönliche Beratung vor Ort.",
  ctaHref: "/#kontakt",
  ctaLabel: "Kontakt aufnehmen →",
};

const markerIcon = L.divIcon({
  className: "",
  html: `<span class="relative flex h-4 w-4">
           <span class="absolute inline-flex h-full w-full animate-pulse-slow rounded-full bg-amber/40"></span>
           <span class="relative block h-4 w-4 rounded-full border-2 border-ink bg-amber shadow-[0_0_16px_3px_rgba(232,168,85,0.6)]"></span>
         </span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function CoverageMap() {
  return (
    <MapContainer
      center={[BASEL.lat, BASEL.lng]}
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
      <Marker position={[BASEL.lat, BASEL.lng]} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -10]} className="coverage-map-label">
          {BASEL.label}
        </Tooltip>
        <Popup className="coverage-map-popup">
          <div className="min-w-[180px]">
            <div className="font-medium">{BASEL.label}</div>
            <p className="mt-1 text-xs opacity-70">{BASEL.address}</p>
            <p className="mt-1 text-xs opacity-80">{BASEL.popupText}</p>
            <a href={BASEL.ctaHref} className="mt-2 inline-block text-xs font-medium underline underline-offset-2">
              {BASEL.ctaLabel}
            </a>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
