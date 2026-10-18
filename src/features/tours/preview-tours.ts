import waterfrontTour from '../../../samples/san-francisco-waterfront/tour.json';
import type { Tour } from './types';

const schemaVersion = waterfrontTour.schemaVersion;

if (schemaVersion !== 1) {
  throw new Error('The bundled tour must use schema version 1.');
}

/** Bundled demo content. Narration is generated from this manifest's transcripts. */
export const previewTours: readonly Tour[] = [{ ...waterfrontTour, schemaVersion }];
