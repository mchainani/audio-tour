import type { Tour } from './types';

export interface TourManifestEntry {
  readonly directory: string;
  readonly manifest: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateTour(value: unknown, directory: string, audioKeys: ReadonlySet<string>): asserts value is Tour {
  function invalid(message: string): never {
    throw new Error(`tours/${directory}/tour.json: ${message}`);
  }

  if (!isRecord(value) || value.schemaVersion !== 1) {
    invalid('Expected a version 1 tour manifest.');
  }
  if (!isText(value.id) || !/^[a-z0-9-]+$/.test(value.id)) {
    invalid('Tour ID must contain lowercase letters, numbers, and hyphens.');
  }
  for (const field of ['title', 'intro', 'language']) {
    if (!isText(value[field])) {
      invalid(`${field} must be nonempty text.`);
    }
  }
  if (value.author !== undefined && !isText(value.author)) {
    invalid('author must be nonempty text when provided.');
  }
  if (!Array.isArray(value.chapters) || value.chapters.length === 0) {
    invalid('Expected at least one chapter.');
  }

  const chapterIds = new Set<string>();
  for (const chapter of value.chapters) {
    if (!isRecord(chapter) || !isText(chapter.id) || !/^[a-z0-9-]+$/.test(chapter.id)) {
      invalid('Each chapter needs a valid ID.');
    }
    if (chapterIds.has(chapter.id)) {
      invalid(`Duplicate chapter ID: ${chapter.id}`);
    }
    chapterIds.add(chapter.id);
    if (!isText(chapter.title) || !isText(chapter.transcript)) {
      invalid(`Chapter ${chapter.id} needs a title and transcript.`);
    }
    const location = chapter.location;
    if (!isRecord(location) || !isText(location.name)
      || typeof location.latitude !== 'number' || !Number.isFinite(location.latitude) || Math.abs(location.latitude) > 90
      || typeof location.longitude !== 'number' || !Number.isFinite(location.longitude) || Math.abs(location.longitude) > 180) {
      invalid(`Chapter ${chapter.id} needs a location name and valid coordinates.`);
    }
    if (!isText(chapter.audio) || !/^audio\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(m4a|mp3|wav)$/i.test(chapter.audio)) {
      invalid(`Chapter ${chapter.id} needs a safe relative path under audio/ (M4A, MP3, or WAV).`);
    }
    if (!audioKeys.has(`./${directory}/${chapter.audio}`)) {
      invalid(`Missing audio file: ${chapter.audio}`);
    }
  }
}

/** Read every manifest, but resolve media only when a chapter requests playback. */
export function createTourLibrary<Asset>(entries: readonly TourManifestEntry[], audioKeys: readonly string[], loadAsset: (key: string) => Asset) {
  const availableAudio = new Set(audioKeys);
  const registeredAudio = new Map<string, ReadonlyMap<string, string>>();
  const tours: Tour[] = [];

  for (const { directory, manifest } of entries) {
    validateTour(manifest, directory, availableAudio);
    if (registeredAudio.has(manifest.id)) {
      throw new Error(`tours/${directory}/tour.json: Duplicate tour ID: ${manifest.id}`);
    }
    registeredAudio.set(manifest.id, new Map(manifest.chapters.map((chapter) => [chapter.audio, `./${directory}/${chapter.audio}`])));
    tours.push(manifest);
  }

  return {
    tours: tours.sort((left, right) => left.title.localeCompare(right.title)) as readonly Tour[],
    loadAudio(tourId: string, audioPath: string): Asset | null {
      const key = registeredAudio.get(tourId)?.get(audioPath);
      return key ? loadAsset(key) : null;
    },
  };
}
