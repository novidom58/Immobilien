"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { OFFICES, officeAddress } from "@/lib/offices";

export type MapListing = {
  id: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  title?: string | null;
  property_type?: string | null;
  price_chf?: number | null;
  status?: string | null;
};


const listingIcon = L.divIcon({
  className: "",
  html: `<span class="block h-3.5 w-3.5 rounded-full border-2 border-ink bg-amber shadow-[0_0_14px_2px_rgba(143,106,57,0.28)]"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const soldIcon = L.divIcon({
  className: "",
  html: `<span class="block h-3 w-3 rounded-full border-2 border-ink bg-ivory-dim/60"></span>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const officeIcon = L.divIcon({
  className: "",
  html: `<span class="relative flex h-4 w-4">
           <span class="absolute inline-flex h-full w-full animate-pulse-slow rounded-full bg-blueprint/40"></span>
           <span class="relative block h-4 w-4 rounded-full border-2 border-ink bg-blueprint shadow-[0_0_16px_3px_rgba(79,107,132,0.45)]"></span>
         </span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Farbige Vektorkarte von OpenFreeMap (frei, ohne Schlüssel, auch kommerziell)
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const OPENFREEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noreferrer">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> Daten © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Der Worker liegt unter public/, weil der Bundler den relativen Pfad der
// Bibliothek nicht auflöst. Bei einem Update von maplibre-gl die Datei neu
// kopieren (node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs).
const WORKER_URL = "/maplibre/maplibre-gl-worker-6.14.0.mjs";

/** Legt die OpenFreeMap-Vektorkarte als Grundkarte in die Leaflet-Karte. */
function VectorBaseLayer({ onFail }: { onFail: () => void }) {
  const map = useMap();
  useEffect(() => {
    setWorkerUrl(WORKER_URL);
    const layer = maplibreGL({ style: OPENFREEMAP_STYLE, attributionControl: false } as Parameters<typeof maplibreGL>[0]);
    layer.options.attribution = OPENFREEMAP_ATTRIBUTION;
    layer.addTo(map);
    // Lädt die Karte nicht (Dienst nicht erreichbar), zurück zur Rasterkarte
    let loaded = false;
    const gl = layer.getMaplibreMap();
    gl.once("load", () => {
      loaded = true;
    });
    gl.on("error", () => {
      if (!loaded) onFail();
    });
    const timer = window.setTimeout(() => {
      if (!loaded) onFail();
    }, 8000);
    return () => {
      window.clearTimeout(timer);
      layer.remove();
    };
  }, [map, onFail]);
  return null;
}

/** Ausschnitt so wählen, dass alle Objekte und beide Büros (Basel, Zug) sichtbar sind. */
function FitAll({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join(";");
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
    // nur neu ausrichten, wenn sich die Punkte ändern
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function MapCanvas({ listings }: { listings: MapListing[] }) {
  // Ohne WebGL (ältere Geräte) bleibt die bisherige graue Rasterkarte
  const [vector, setVector] = useState(() => typeof window !== "undefined" && hasWebGL());
  const fallback = useCallback(() => setVector(false), []);
  return (
    <MapContainer
      center={[47.545, 7.63]}
      zoom={10}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <FitAll points={[...OFFICES.map((o) => [o.lat, o.lng] as [number, number]), ...listings.map((l) => [l.lat, l.lng] as [number, number])]} />
      {vector ? (
        <VectorBaseLayer onFail={fallback} />
      ) : (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, FAO, NOAA, USGS'
        />
      )}
      {OFFICES.map((office) => (
        <Marker key={office.city} position={[office.lat, office.lng]} icon={officeIcon}>
          <Tooltip permanent direction="top" offset={[0, -10]} className="coverage-map-label">
            {office.label}
          </Tooltip>
          <Popup>
            <div className="min-w-[180px]">
              <div className="font-medium">{office.label}</div>
              <p className="mt-1 text-xs opacity-70">{officeAddress(office)}</p>
              <Link href="/#kontakt" className="mt-2 inline-block text-xs font-medium underline underline-offset-2">
                Kontakt aufnehmen →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {listings.map((listing) => (
        <Marker key={listing.id} position={[listing.lat, listing.lng]} icon={listing.status === "sold" ? soldIcon : listingIcon}>
          <Popup>
            <div className="min-w-[160px]">
              <div className="font-medium">{listing.title || listing.address}</div>
              <div className="text-xs opacity-70">{listing.city}</div>
              {listing.status === "sold" ? (
                <Link href="/immobilien#referenzen" className="mt-1 inline-block text-xs font-medium underline underline-offset-2">
                  Verkauft · Referenzen ansehen →
                </Link>
              ) : (
                <a
                  href={`/immobilien/${listing.id}`}
                  className="mt-1 inline-block text-xs font-medium underline underline-offset-2"
                >
                  Details ansehen →
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
