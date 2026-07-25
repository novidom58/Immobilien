"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type ServiceArea = { name: string; lat: number; lng: number };
export type MapListing = { id: string; address: string; city: string; lat: number; lng: number };

const AREAS: ServiceArea[] = [
  { name: "Basel-Stadt", lat: 47.5596, lng: 7.5886 },
  { name: "Riehen", lat: 47.5878, lng: 7.6494 },
  { name: "Bettingen", lat: 47.5827, lng: 7.6702 },
  { name: "Binningen", lat: 47.5389, lng: 7.5719 },
  { name: "Allschwil", lat: 47.5477, lng: 7.5386 },
  { name: "Reinach", lat: 47.4936, lng: 7.5911 },
  { name: "Muttenz", lat: 47.5222, lng: 7.6472 },
  { name: "Arlesheim", lat: 47.4886, lng: 7.6224 },
  { name: "Pratteln", lat: 47.5225, lng: 7.6928 },
  { name: "Liestal", lat: 47.4838, lng: 7.7343 },
];

const areaIcon = L.divIcon({
  className: "",
  html: `<span class="block h-2.5 w-2.5 rounded-full bg-amber-soft/70 ring-4 ring-amber/15"></span>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const listingIcon = L.divIcon({
  className: "",
  html: `<span class="block h-3.5 w-3.5 rounded-full border-2 border-ink bg-amber shadow-[0_0_14px_2px_rgba(232,168,85,0.7)]"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
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
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {AREAS.map((area) => (
        <Marker key={area.name} position={[area.lat, area.lng]} icon={areaIcon}>
          <Popup>{area.name}</Popup>
        </Marker>
      ))}
      {listings.map((listing) => (
        <Marker key={listing.id} position={[listing.lat, listing.lng]} icon={listingIcon}>
          <Popup>
            {listing.address}, {listing.city}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
