import type { MapLocation } from '../tours/types.ts';

type RoutePoint = [latitude: number, longitude: number];

let nextRequestAt = 0;

export async function loadWalkingRoute(locations: readonly MapLocation[], signal: AbortSignal): Promise<RoutePoint[]> {
  if (locations.length < 2) return [];
  signal.throwIfAborted();

  // The public routing service allows at most one request per second.
  const now = Date.now();
  const delay = Math.max(0, nextRequestAt - now);
  nextRequestAt = now + delay + 1000;
  if (delay > 0) {
    await new Promise<void>((resolve, reject) => {
      const cancel = () => {
        clearTimeout(timer);
        reject(signal.reason);
      };
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', cancel);
        resolve();
      }, delay);
      signal.addEventListener('abort', cancel, { once: true });
    });
  }
  signal.throwIfAborted();

  const waypoints = locations.map(({ latitude, longitude }) => `${longitude},${latitude}`).join(';');
  const response = await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${waypoints}?overview=full&geometries=geojson&steps=false`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  });
  if (!response.ok) throw new Error('Walking route unavailable.');

  const data = await response.json();
  const geometry = data?.routes?.[0]?.geometry;
  const coordinates: unknown = geometry?.coordinates;
  if (data?.code !== 'Ok' || geometry?.type !== 'LineString' || !Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error('Walking route unavailable.');
  }
  return coordinates.map((point: unknown): RoutePoint => {
    if (!Array.isArray(point) || point.length < 2 || !Number.isFinite(point[0]) || !Number.isFinite(point[1]) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) {
      throw new Error('Walking route unavailable.');
    }
    return [point[1], point[0]];
  });
}
