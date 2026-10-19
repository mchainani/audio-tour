# New York City: Lower Manhattan

Five short chapters connect The Battery, Bowling Green, Trinity Church, Federal Hall, and the Manhattan pedestrian entrance to the Brooklyn Bridge. Each includes an original transcript, a stop coordinate, and AI-synthesized narration by Microsoft's online Ava neural voice (`en-US-AvaNeural`, American female, rate `-5%`).

`tour.json`, `transcripts/`, `audio/`, and `images/` are the source files the app discovers. Each chapter's `transcript` field references its own `.txt` file in this tour's `transcripts/` directory. Each chapter also has two or three locally bundled photos in an ordered `images` array, shown in the separate **PHOTOS** section. See [photo sources and licenses](images/README.md); machine-readable source records are in `images/sources.json`.

`new-york-city.zip` contains the same manifest, transcripts, audio, and images for the future package importer. The locations are approximate exterior stops; this demo is not a complete walking itinerary or access guide.

With the speech dependencies installed, run `npm run generate:audio -- new-york-city` from the project root to regenerate only this tour. Omit the directory name to regenerate all tours. Generation sends the transcripts to Microsoft's online speech service using the third-party `edge-tts` client, then converts the returned audio to M4A locally. See the root README for setup.
