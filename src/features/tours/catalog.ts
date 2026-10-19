import { createTourLibrary } from './tour-library';

// Vite discovers every direct tour directory. URL imports do not fetch media bytes.
const manifests = import.meta.glob<unknown>('../../../tours/*/tour.json', { eager: true, import: 'default' });
const transcriptFiles = import.meta.glob<string>('../../../tours/*/transcripts/*.txt', { eager: true, query: '?raw', import: 'default' });
const audio = import.meta.glob<string>('../../../tours/*/audio/**/*', { eager: true, query: '?url', import: 'default' });
const imageFiles = import.meta.glob<string>('../../../tours/*/images/**/*', { eager: true, query: '?url', import: 'default' });
const keyFor = (path: string) => path.replace('../../../tours/', './');
const media = new Map(Object.entries(audio).filter(([path]) => /\.(m4a|mp3|wav)$/i.test(path)).map(([path, url]) => [keyFor(path), url]));
const library = createTourLibrary(
  Object.entries(manifests).map(([path, manifest]) => ({ directory: keyFor(path).split('/')[1], manifest })),
  [...media.keys()],
  (key) => media.get(key) ?? null,
  new Map(Object.entries(transcriptFiles).map(([path, text]) => [keyFor(path), text])),
  new Map(Object.entries(imageFiles).filter(([path]) => /\.(jpe?g|png|webp|avif)$/i.test(path)).map(([path, url]) => [keyFor(path), url])),
);

export const tours = library.tours;
export const loadTourAudio = library.loadAudio;
export const hasTourAudio = library.hasAudio;
export const loadTourTranscript = library.loadTranscript;
export const loadTourImage = library.loadImage;
