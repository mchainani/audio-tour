import type { MapLocation, Tour } from './types';

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

function isLocation(value: unknown): value is MapLocation {
  return isRecord(value) && isText(value.name)
    && typeof value.latitude === 'number' && Number.isFinite(value.latitude) && Math.abs(value.latitude) <= 90
    && typeof value.longitude === 'number' && Number.isFinite(value.longitude) && Math.abs(value.longitude) <= 180;
}

function validateTour(value: unknown, directory: string, audioKeys: ReadonlySet<string>, transcripts: ReadonlyMap<string, string>): asserts value is Tour {
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
  if (!isLocation(value.location)) {
    invalid('Tour needs a location name and valid coordinates.');
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
    if (!isText(chapter.title)) {
      invalid(`Chapter ${chapter.id} needs a title.`);
    }
    if (!isText(chapter.transcript) || !/^transcripts\/[a-z0-9_-]+\.txt$/.test(chapter.transcript)) {
      invalid(`Chapter ${chapter.id} needs a safe relative .txt path under transcripts/.`);
    }
    const transcriptKey = `./${directory}/${chapter.transcript}`;
    if (!transcripts.has(transcriptKey)) {
      invalid(`Missing transcript file: ${chapter.transcript}`);
    }
    if (!isText(transcripts.get(transcriptKey))) {
      invalid(`Empty transcript file: ${chapter.transcript}`);
    }
    if (!isLocation(chapter.location)) {
      invalid(`Chapter ${chapter.id} needs a location name and valid coordinates.`);
    }
    if (chapter.audio !== undefined) {
      if (!isText(chapter.audio) || !/^audio\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(m4a|mp3|wav)$/i.test(chapter.audio)) {
        invalid(`Chapter ${chapter.id} needs a safe relative path under audio/ (M4A, MP3, or WAV).`);
      }
      if (!audioKeys.has(`./${directory}/${chapter.audio}`)) {
        invalid(`Missing audio file: ${chapter.audio}`);
      }
    }
  }
}

/** Validate manifests and transcript files, but resolve media only on playback. */
export function createTourLibrary<Asset>(entries: readonly TourManifestEntry[], audioKeys: readonly string[], loadAsset: (key: string) => Asset, transcripts: ReadonlyMap<string, string>) {
  const availableAudio = new Set(audioKeys);
  const registeredAudio = new Map<string, ReadonlyMap<string, string>>();
  const registeredTranscripts = new Map<string, ReadonlyMap<string, string>>();
  const tours: Tour[] = [];

  for (const { directory, manifest } of entries) {
    validateTour(manifest, directory, availableAudio, transcripts);
    if (registeredAudio.has(manifest.id)) {
      throw new Error(`tours/${directory}/tour.json: Duplicate tour ID: ${manifest.id}`);
    }
    registeredAudio.set(manifest.id, new Map(manifest.chapters.flatMap((chapter) =>
      chapter.audio ? [[chapter.audio, `./${directory}/${chapter.audio}`] as const] : [])));
    registeredTranscripts.set(manifest.id, new Map(manifest.chapters.map((chapter) =>
      [chapter.transcript, transcripts.get(`./${directory}/${chapter.transcript}`)!])));
    tours.push(manifest);
  }

  return {
    tours: tours.sort((left, right) => left.title.localeCompare(right.title)) as readonly Tour[],
    loadTranscript(tourId: string, transcriptPath: string): string | null {
      return registeredTranscripts.get(tourId)?.get(transcriptPath) ?? null;
    },
    loadAudio(tourId: string, audioPath?: string): Asset | null {
      const key = audioPath ? registeredAudio.get(tourId)?.get(audioPath) : undefined;
      return key ? loadAsset(key) : null;
    },
  };
}
