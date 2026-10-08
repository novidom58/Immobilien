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
