# Tour manifest, version 1

The TypeScript contract lives in `src/features/tours/types.ts`. A tour package is a ZIP with `tour.json` at its root and transcript, audio, and optional photo files at the paths referenced by each chapter:

```text
waterfront.zip
  tour.json
  transcripts/
    ferry-building.txt
  audio/
    ferry-building.m4a
  images/
    ferry-building-front.jpg
    ferry-building-detail.jpg
```

The app discovers `tours/<directory>/tour.json` and validates its manifest structure before listing it. Missing referenced files do not prevent the tour or other chapters from loading. Every chapter references its own UTF-8 plain text file under that tour's `transcripts/` directory. Chapter audio is optional: omit `audio` for a chapter with a transcript and map only. The app does not mount playback controls for these chapters. When supplied, each audio path is relative to that tour directory, with files under `audio/`. Audio is resolved and opened only when playback is requested. [San Francisco](../tours/san-francisco-waterfront/san-francisco-waterfront.zip) has three chapters, and [New York City](../tours/new-york-city/new-york-city.zip) has five. **ZIP import is not implemented yet.** The following abbreviated manifest illustrates the contract.

```json
{
  "schemaVersion": 1,
  "id": "san-francisco-waterfront",
  "title": "San Francisco waterfront",
  "intro": "Explore the stories along the edge of the bay.",
  "location": {
    "name": "San Francisco",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "language": "en-US",
  "author": "Audio Tour",
  "chapters": [
    {
      "id": "ferry-building",
      "title": "Where the city meets the bay",
      "location": {
        "name": "Ferry Building",
        "latitude": 37.7955,
        "longitude": -122.3937
      },
      "transcript": "transcripts/ferry-building.txt",
      "audio": "audio/ferry-building.m4a",
      "images": ["images/ferry-building-front.jpg", "images/ferry-building-detail.jpg"]
    }
  ]
}
```

| Field | Contract |
| --- | --- |
| `schemaVersion` | Exactly `1` |
| `id` | Stable, nonempty tour identifier; unique in a library |
| `title`, `intro` | Nonempty plain text |
| `location.name` | Nonempty city or area name shown in the library |
| `location.latitude` | Tour city/area latitude in decimal degrees, from -90 to 90 |
| `location.longitude` | Tour city/area longitude in decimal degrees, from -180 to 180 |
| `language` | Language tag, such as `en-US` |
| `author` | Optional plain text |
| `chapters` | Nonempty array; array order is chapter order |
| `chapters[].id` | Nonempty identifier; unique within the tour |
| `chapters[].title` | Nonempty plain text |
| `chapters[].location.name` | Human-readable stop name |
| `chapters[].location.latitude` | Decimal degrees, from -90 to 90 |
| `chapters[].location.longitude` | Decimal degrees, from -180 to 180 |
| `chapters[].transcript` | Required package-relative path `transcripts/<name>.txt`; filename uses lowercase letters, digits, hyphens, or underscores. References a UTF-8 plain text file; missing or blank files display **Transcript not available**. Inline text, absolute paths, and parent traversal are invalid. Separate paragraphs in the file with a blank line. |
| `chapters[].audio` | Optional package-relative audio path; omit for text-only chapters. When supplied, it references a file under `audio/`, with no absolute path or parent traversal. `null` and empty strings are invalid. Missing files display **Audio not available** without mounting playback controls. Runtime failures show the same message with a Retry button. |
| `chapters[].images` | Optional ordered list of photo paths relative to the tour directory, under `images/`. JPEG (`.jpg`/`.jpeg`), PNG, WebP, and AVIF are supported, including nested directories. Path segments use letters, digits, hyphens, or underscores; extensions are case insensitive. Missing files and failed browser loads are skipped. Absolute paths, parent traversal, remote URLs, and `null` are invalid. Omit the field or use `[]` to hide the carousel. |

Chapter photos appear in a separate **PHOTOS** section after **THIS STOP** (the location map and stop details) and before the transcript. The carousel shows one photo at a time in manifest order. Swipe left or right, use the previous/next buttons, or focus the carousel and press the left/right arrow keys. Navigation wraps from the last photo to the first and back. A single photo is shown without navigation controls. Photos do not advance automatically, and a failed image request removes that photo and advances to the next available photo. The count and controls reflect the remaining photos. If all photos fail, the entire photo section disappears.

The required top-level `location` places the tour on the library map; chapter `location` fields place individual stops on the tour map. Both use a name and finite coordinates. Existing manifests need this top-level field before they can be published. Library map pins and cards share the catalog's alphabetical tour ordering, numbered from 1.

The directory catalog validates schema version, required text, unique IDs, coordinates, and safe transcript/audio/photo paths. File availability is handled separately so a broken reference does not invalidate the catalog. IDs use lowercase letters, digits, and hyphens. Transcript references remain paths in the `Tour` objects; the app resolves their text through the catalog. Vite bundles transcript text for reading without an additional request. It accepts M4A, MP3, and WAV audio paths; current narration uses mono AAC at 44.1 kHz in M4A containers. The public app has no upload/import interface; tour artifacts are published from the repository.
