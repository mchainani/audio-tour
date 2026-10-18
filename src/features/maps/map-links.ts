import type { ChapterLocation } from '../tours/types';

/** Share the stored stop, without requesting the listener's location. */
export function mapLinks(location: ChapterLocation) {
  const coordinates = encodeURIComponent(`${location.latitude},${location.longitude}`);
  return {
    apple: `https://maps.apple.com/?ll=${coordinates}&q=${encodeURIComponent(location.name)}`,
    googleWeb: `https://www.google.com/maps/search/?api=1&query=${coordinates}`,
  };
}
