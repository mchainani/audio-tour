# Chapter audio playback

The San Francisco demo has three narrated chapters, generated directly from its manifest transcripts using Microsoft's online Ava neural voice (`en-US-AvaNeural`, American female) at a slightly relaxed `-5%` rate. These are AI-synthesized demo recordings. The app bundles the same AAC/M4A files included in `samples/san-francisco-waterfront.zip`.

## Behavior

- One shared `expo-audio` player owns playback across the navigation stack.
- Opening a chapter loads its narration paused at the beginning. Leaving the chapter pauses it. Playback position is not persisted.
- Controls include play/pause, replay after finishing, 15-second backward/forward skips, seeking, elapsed time, and duration. Seeks stay within the recording's bounds.
- The browser seek input supports pointer dragging, one-second arrow keys, ten-second PageUp/PageDown, and Home/End. Native uses the community slider.
- Loading disables transport controls. An audio error displays an alert and a retry action. Missing narration displays an unavailable message.
- Transcripts remain visible while narration loads or fails.

Static Metro imports in `bundled-audio.ts` resolve the manifest's portable relative paths. The manifest and audio files are ready for the future package importer, which is not implemented in this increment.

## Native configuration

The playback-only Expo audio plugin disables recording permissions and enables background playback. The root session is configured to play with the iPhone silent switch enabled, continue in the background, and avoid mixing with other audio. Starting playback activates lock-screen metadata; leaving the chapter clears the controls.

These settings require an iOS development build and device validation. Browser checks do not establish silent-switch, interruption, background, or lock-screen behavior. Before treating iPhone support as verified, test those cases on a device, along with native seeking and chapter navigation.

## Browser verification — 2026-10-18

Verified against the local Expo development server:

- All three bundled recordings load and play with their chapter's transcript.
- Play advances elapsed time; pause retains the position.
- Forward/backward skips work and stay in range.
- Pointer seeking and keyboard arrows, PageUp, Home, and End work. End reaches the full fractional duration.
- Natural playback completion displays Finished and Replay; replay starts again.
- Switching chapters while playing resets the destination to paused at zero. Returning through the library also opens a paused chapter.
- Fault injection using an invalid local audio file displays an error with disabled transport controls; restoring a valid file and retrying recovers playback. The temporary fixture was removed afterward.
- At 390 × 844, controls fit and the chapter has no horizontal overflow. This is a responsive browser check, not a native device test.

Repeat the walkthrough after changing player lifecycle behavior. For static verification, run `npm run typecheck`, `npm run lint`, `npm run build:web`, `npx expo install --check`, and `npx expo-doctor`.

Those checks passed for this increment, including all 20 Expo Doctor checks. An iOS JavaScript/asset export also passed using `npx expo export --platform ios`; this does not compile or run a native app. All three M4A files decoded successfully to non-silent PCM, and their bytes and manifest matched the ZIP package.

After replacing the original system voice with Ava, all three regenerated recordings were checked again: each decoded to non-silent PCM, differed from the previous audio, and matched the rebuilt ZIP. The manifest and transcripts were unchanged. Browser playback advanced and paused successfully for each new file, with durations of approximately 23, 19, and 25 seconds. TypeScript, lint, generator syntax, and the production web export passed again.

## Regenerate narration

On macOS, install the Python speech client once. Then edit `samples/san-francisco-waterfront/tour.json` and regenerate:

```sh
python3 -m venv .venv-audio
.venv-audio/bin/python -m pip install -r scripts/requirements-audio.txt
npm run generate:audio
```

The script sends chapter transcripts to Microsoft's online speech service using the third-party `edge-tts` client. It stages the returned audio, converts it locally to mono AAC/M4A at 44.1 kHz and 96 kbps, then copies completed files and creates the ZIP. Internet access is required for generation, with no API key. App playback uses the bundled recordings and does not contact the service.

`NARRATION_VOICE` and `NARRATION_RATE` optionally select another online voice and relative speaking rate (signed percentage, such as `-5%`). `NARRATION_PYTHON` selects another interpreter with `edge-tts` installed. Keep bundled imports in sync if adding or renaming chapter audio paths. The macOS `say` generator has been replaced; no system text-to-speech is used.
