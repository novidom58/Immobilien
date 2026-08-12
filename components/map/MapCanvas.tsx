"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
