# San Francisco waterfront

Three short demo chapters with original transcripts and AI-synthesized narration. The narrator is Microsoft's online Ava neural voice (`en-US-AvaNeural`), an American female voice, at `-5%` relative speaking rate. Audio files are AAC in an M4A container, generated from the unchanged text in each chapter's file under `transcripts/`, referenced by `tour.json`.

The app and generation script share this manifest. Set up the Python speech client once on a Mac:

```sh
python3 -m venv .venv-audio
.venv-audio/bin/python -m pip install -r scripts/requirements-audio.txt
```

Edit the appropriate `.txt` file in this tour's `transcripts/` directory, then run `npm run generate:audio -- san-francisco-waterfront` to regenerate this tour’s narration and `tours/san-francisco-waterfront/san-francisco-waterfront.zip`. The third-party `edge-tts` client sends transcripts to Microsoft's online speech service; internet access is required, with no API key. macOS `afconvert` only converts the returned audio to AAC/M4A. You can override `NARRATION_VOICE`, `NARRATION_RATE` (for example `+0%`), and `NARRATION_PYTHON` when running the command. A generation failure leaves the previous completed audio files and ZIP in place.

Each chapter also has two or three locally bundled photos, referenced by its ordered `images` array in `tour.json`. The carousel shows them in the separate **PHOTOS** section. See [photo sources and licenses](images/README.md); machine-readable source records are in `images/sources.json`.

The ZIP contains `tour.json` at the root and its `transcripts/`, `audio/`, and `images/` directories. The app currently bundles these assets; ZIP import is a separate upcoming feature. The content is demonstration material, not a complete walking itinerary or access guide.
