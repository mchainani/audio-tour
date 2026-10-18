# Tour manifest, version 1

The TypeScript contract lives in `src/features/tours/types.ts`. A tour package will be a ZIP with `tour.json` at its root and audio files at the paths referenced by each chapter:

```text
waterfront.zip
  tour.json
  audio/
    ferry-building.m4a
```

The app defines the types and bundles a complete [San Francisco demo package](../samples/san-francisco-waterfront.zip) with playable narration. **Package import and runtime validation are not implemented yet.** The following abbreviated manifest illustrates the contract; the full demo has three chapters.

```json
{
  "schemaVersion": 1,
  "id": "san-francisco-waterfront",
  "title": "San Francisco waterfront",
  "intro": "Explore the stories along the edge of the bay.",
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
      "transcript": "Begin by looking up at the Ferry Building’s clock tower.",
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
| `language` | Language tag, such as `en-US` |
| `author` | Optional plain text |
| `chapters` | Nonempty array; array order is chapter order |
| `chapters[].id` | Nonempty identifier; unique within the tour |
| `chapters[].title` | Nonempty plain text |
| `chapters[].location.name` | Human-readable stop name |
| `chapters[].location.latitude` | Decimal degrees, from -90 to 90 |
| `chapters[].location.longitude` | Decimal degrees, from -180 to 180 |
| `chapters[].transcript` | Nonempty plain text; separate paragraphs with `\n\n` |
| `chapters[].audio` | Package-relative audio path, with no absolute path or parent traversal |

The importer will enforce this contract at runtime before accepting a package. TypeScript types alone do not validate uploaded JSON. Bundled demo audio uses mono AAC at 44.1 kHz in M4A containers. The accepted import formats and package size limits will be fixed when the importer is added.
