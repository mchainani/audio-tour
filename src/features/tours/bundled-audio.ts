import type { AudioSource } from 'expo-audio';

import exploratorium from '../../../samples/san-francisco-waterfront/audio/exploratorium.m4a';
import ferryBuilding from '../../../samples/san-francisco-waterfront/audio/ferry-building.m4a';
import pierSeven from '../../../samples/san-francisco-waterfront/audio/pier-seven.m4a';

// Metro needs static asset imports. Keep portable manifest paths separate from asset IDs.
const bundledAudio = new Map<string, ReadonlyMap<string, AudioSource>>([
  ['san-francisco-waterfront', new Map([
    ['audio/ferry-building.m4a', ferryBuilding],
    ['audio/pier-seven.m4a', pierSeven],
    ['audio/exploratorium.m4a', exploratorium],
  ])],
]);

export function getBundledAudio(tourId: string, audioPath: string): AudioSource {
  return bundledAudio.get(tourId)?.get(audioPath) ?? null;
}
