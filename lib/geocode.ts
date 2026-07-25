/**
 * Free geocoding via OpenStreetMap Nominatim - no API key required.
 * Returns null on any failure so callers can save the listing anyway and
 * let an admin fill in coordinates manually later.
 */
export async function geocodeAddress(address: string, city: string) {
  try {
    const query = encodeURIComponent(`${address}, ${city}, Schweiz`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
      {
        headers: {
          // Nominatim's usage policy requires an identifying User-Agent.
          "User-Agent": "NoviDom-Immo/1.0 (beratung@novidom-immo.ch)",
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;

    const results = (await res.json()) as { lat: string; lon: string }[];
    const first = results[0];
    if (!first) return null;

    return { lat: Number(first.lat), lng: Number(first.lon) };
  } catch {
    return null;
  }
}
