# Tour manifest, version 1

The TypeScript contract lives in `src/features/tours/types.ts`. A tour package is a ZIP with `tour.json` at its root and transcript and audio files at the paths referenced by each chapter:

```text
waterfront.zip
  tour.json
  transcripts/
    ferry-building.txt
  audio/
    ferry-building.m4a
```

The app discovers `tours/<directory>/tour.json` and validates its manifest, required transcript files, and any referenced audio before listing it. Every chapter references its own UTF-8 plain text file under that tour's `transcripts/` directory. Chapter audio is optional: omit `audio` for a chapter with a transcript and map only. The app does not mount playback controls for these chapters. When supplied, each audio path is relative to that tour directory, with files under `audio/`. Audio is resolved and opened only when playback is requested. [San Francisco](../tours/san-francisco-waterfront/san-francisco-waterfront.zip) has three chapters, and [New York City](../tours/new-york-city/new-york-city.zip) has five. **ZIP import is not implemented yet.** The following abbreviated manifest illustrates the contract.

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
      "audio": "audio/ferry-building.m4a"
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
| `chapters[].transcript` | Required package-relative path `transcripts/<name>.txt`; filename uses lowercase letters, digits, hyphens, or underscores. Must reference an existing, nonblank UTF-8 plain text file. Inline text, absolute paths, and parent traversal are invalid. Separate paragraphs in the file with a blank line. |
| `chapters[].audio` | Optional package-relative audio path; omit for text-only chapters. When supplied, it must reference an existing file under `audio/`, with no absolute path or parent traversal. `null` and empty strings are invalid. |

The required top-level `location` places the tour on the library map; chapter `location` fields place individual stops on the tour map. Both use a name and finite coordinates. Existing manifests need this top-level field before they can be published. Library map pins and cards share the catalog's alphabetical tour ordering, numbered from 1.

The directory catalog validates schema version, required text, unique IDs, coordinates, safe transcript/audio paths, file presence, and nonblank transcript contents. IDs use lowercase letters, digits, and hyphens. Transcript references remain paths in the `Tour` objects; the app resolves their text through the catalog. Vite bundles transcript text for reading without an additional request. It accepts M4A, MP3, and WAV audio paths; current narration uses mono AAC at 44.1 kHz in M4A containers. The public app has no upload/import interface; tour artifacts are published from the repository.
