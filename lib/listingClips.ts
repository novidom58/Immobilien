// Videoclips für den Flythrough liegen im Bucket "listing-photos" unter
// <listing_id>/clips/. Die Dateinamen beginnen mit einer zweistelligen
// Nummer, damit Clip 01 zu Foto 01 gehört, Clip 02 zu Foto 02 usw.
export const CLIP_BUCKET = "listing-photos";

export function clipFolder(listingId: string) {
  return `${listingId}/clips`;
}

export function isClipFile(name: string) {
  return /\.(mp4|webm|mov)$/i.test(name);
}

// Drohnenflug: Übergangs-Clips, die jeweils von einem Raum in den nächsten
// fliegen (Clip 01 = Aussen -> Wohnen usw.) und zusammen einen Flug ohne
// Schnitt ergeben. Der Dateiname liefert die Beschriftung, z.B.
// "01-aussen-wohnen.mp4" -> "Aussen → Wohnen".
export function flightFolder(listingId: string) {
  return `${listingId}/flight`;
}

const UMLAUT_WORDS: Record<string, string> = {
  kueche: "Küche",
  buero: "Büro",
  aussicht: "Aussicht",
  schlafzimmer: "Schlafzimmer",
  badezimmer: "Badezimmer",
  eingang: "Eingang",
};

export function flightLabel(fileName: string) {
  const words = fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^(\d+[-_ ]*)+/, "")
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((w) => UMLAUT_WORDS[w.toLowerCase()] ?? w.charAt(0).toUpperCase() + w.slice(1));
  return words.join(" → ");
}
