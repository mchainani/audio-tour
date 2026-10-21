import type { ChapterLocation } from '../tours/types';

/** Share the stored stop, without requesting the listener's location. */
export function mapLinks(location: ChapterLocation) {
  const coordinates = encodeURIComponent(`${location.latitude},${location.longitude}`);
  // Uber universal links use JSON stops; dropoff[...] is for the native URL scheme.
  const uberParams = new URLSearchParams({
    pickup: 'my_location',
    'drop[0]': JSON.stringify({
      latitude: location.latitude,
      longitude: location.longitude,
      addressLine1: location.name,
    }),
  });
  return {
    apple: `https://maps.apple.com/?ll=${coordinates}&q=${encodeURIComponent(location.name)}`,
    googleWeb: `https://www.google.com/maps/search/?api=1&query=${coordinates}`,
    uber: `https://m.uber.com/looking?${uberParams}`,
  };
}
