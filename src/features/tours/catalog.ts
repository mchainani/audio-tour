import type { AudioSource } from 'expo-audio';

import { createTourLibrary } from './tour-library';

// Metro updates these contexts when tour folders or their files change.
const manifests = require.context('../../../tours', true, /^\.\/[^/]+\/tour\.json$/);
const audio = require.context('../../../tours', true, /^\.\/[^/]+\/audio\/.+\.(m4a|mp3|wav)$/i);

const library = createTourLibrary(
  manifests.keys().map((key) => ({ directory: key.split('/')[1], manifest: manifests<unknown>(key) })),
  audio.keys(),
  (key) => audio<AudioSource>(key),
);

export const tours = library.tours;
export const loadTourAudio = library.loadAudio;
