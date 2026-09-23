"use client";

import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapListing = {
  id: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  title?: string | null;
  property_type?: string | null;
  price_chf?: number | null;
};

const OFFICE = {
  label: "Basel · Büro",
  lat: 47.5596,
  lng: 7.5886,
  address: "Güterstrasse 14, 4053 Basel (vorläufig — definitive Adresse folgt)",
};

const listingIcon = L.divIcon({
  className: "",
  html: `<span class="block h-3.5 w-3.5 rounded-full border-2 border-ink bg-amber shadow-[0_0_14px_2px_rgba(232,168,85,0.7)]"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const officeIcon = L.divIcon({
  className: "",
  html: `<span class="relative flex h-4 w-4">
           <span class="absolute inline-flex h-full w-full animate-pulse-slow rounded-full bg-blueprint/40"></span>
           <span class="relative block h-4 w-4 rounded-full border-2 border-ink bg-blueprint shadow-[0_0_16px_3px_rgba(95,184,232,0.6)]"></span>
         </span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapCanvas({ listings }: { listings: MapListing[] }) {
  return (
    <MapContainer
      center={[47.545, 7.63]}
      zoom={10}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, FAO, NOAA, USGS'
      />
      <Marker position={[OFFICE.lat, OFFICE.lng]} icon={officeIcon}>
        <Tooltip permanent direction="top" offset={[0, -10]} className="coverage-map-label">
          {OFFICE.label}
        </Tooltip>
        <Popup>
          <div className="min-w-[180px]">
            <div className="font-medium">{OFFICE.label}</div>
            <p className="mt-1 text-xs opacity-70">{OFFICE.address}</p>
            <Link href="/#kontakt" className="mt-2 inline-block text-xs font-medium underline underline-offset-2">
              Kontakt aufnehmen →
            </Link>
          </div>
        </Popup>
      </Marker>
      {listings.map((listing) => (
        <Marker key={listing.id} position={[listing.lat, listing.lng]} icon={listingIcon}>
          <Popup>
            <div className="min-w-[160px]">
              <div className="font-medium">{listing.title || listing.address}</div>
              <div className="text-xs opacity-70">{listing.city}</div>
              <a
                href={`/immobilien/${listing.id}`}
                className="mt-1 inline-block text-xs font-medium underline underline-offset-2"
              >
                Details ansehen →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
