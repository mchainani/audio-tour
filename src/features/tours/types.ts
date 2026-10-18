/** Coordinates belong to the chapter's stop, not the listener's position. */
export interface ChapterLocation {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface Chapter {
  readonly id: string;
  readonly title: string;
  readonly location: ChapterLocation;
  readonly transcript: string;
  /** Package-relative path, for example audio/ferry-building.m4a. */
  readonly audio: string;
}

/** Version 1 of the portable tour.json manifest. */
export interface Tour {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly title: string;
  readonly intro: string;
  readonly language: string;
  readonly author?: string;
  readonly chapters: readonly Chapter[];
}
