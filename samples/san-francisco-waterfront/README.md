# San Francisco waterfront

Three short demo chapters with original transcripts and synthesized narration. The voice is macOS Samantha at 155 words per minute. Audio files are AAC in an M4A container, generated directly from each chapter's transcript in `tour.json`.

The app and generation script share this manifest. Edit the transcript here, then run `npm run generate:audio` on a Mac to regenerate all narration and `samples/san-francisco-waterfront.zip`. You can override `NARRATION_VOICE` and `NARRATION_RATE` when running the command.

The ZIP contains `tour.json` at the root and its `audio/` directory. The app currently bundles these assets; ZIP import is a separate upcoming feature. The content is demonstration material, not a complete walking itinerary or access guide.
