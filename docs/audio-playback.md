# Chapter audio playback

The San Francisco tour has three narrated chapters and the New York City tour has five. Both use Microsoft's online Ava neural voice (`en-US-AvaNeural`, American female) at a slightly relaxed `-5%` rate. These are AI-synthesized demo recordings. Each `tours/<directory>/` contains a manifest, its `audio/` files, and a matching ZIP.

## Behavior

- One shared `expo-audio` player owns playback across the navigation stack.
- Opening a chapter displays Ready to listen without resolving or fetching its audio. Play resolves and loads only that chapter's audio, then starts playback. Leaving the chapter pauses playback and clears the source. Playback position is not persisted.
- Controls include play/pause, replay after finishing, 15-second backward/forward skips, seeking, elapsed time, and duration. Seeks stay within the recording's bounds.
- The browser seek input supports pointer dragging, one-second arrow keys, ten-second PageUp/PageDown, and Home/End. Native uses the community slider.
- Until Play, elapsed time is zero and duration is unknown. Loading disables transport controls. An audio error displays an alert and a retry action; retry requests playback again. Missing narration displays an unavailable message.
- Transcripts remain visible while narration loads or fails.

Metro directory contexts in `catalog.ts` discover every direct tour subdirectory containing `tour.json`. The catalog reads and validates metadata, including audio-file presence, without resolving media modules. The selected audio module is resolved only when Play or Retry invokes the chapter's source loader. Native installations bundle the assets but do not open the chapter's media until requested. The future ZIP importer is not implemented in this increment.

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

## Directory catalog and on-demand playback verification — 2026-10-18

- The library lists San Francisco's three chapters and New York City's five chapters from their `tours/<directory>/tour.json` manifests. A temporary third source directory appeared without registry edits; removing it returned the library to two tours. Directories without a manifest are ignored.
- An instrumented local server serving the production web export recorded zero audio requests while browsing the library, overview, and an unplayed chapter. First Play fetched only the selected Battery recording. Switching chapters while playing reset the destination to Ready to listen without fetching its audio.
- All five New York chapters played, advanced elapsed time, and paused. Seeking, replay, and the migrated Ferry Building recording were checked. An invalid file injected into the temporary web export displayed the error state; restoring it and choosing Retry recovered playback. Source media was unchanged.
- The library and New York chapter were inspected at 390 × 844. The player controls fit, and transcripts remained readable. Screenshots are saved in `docs/screenshots/new-york-chapter-mobile.jpg` and `docs/screenshots/new-york-chapter.jpg`.
- All eight M4A files decoded to non-silent PCM. Both ZIPs exactly matched their manifests and audio. San Francisco's moved audio files were byte-identical to their previous versions.
- Six catalog tests, TypeScript, ESLint, and production web/iOS JavaScript and asset exports passed. The test runner enables TypeScript stripping explicitly for the supported Node 22 range. Native device playback remains unverified.

## Regenerate narration

On macOS, install the Python speech client once. Then edit a tour manifest and regenerate that tour, or omit its directory name to regenerate every tour:

```sh
python3 -m venv .venv-audio
.venv-audio/bin/python -m pip install -r scripts/requirements-audio.txt
npm run generate:audio -- new-york-city
```

The script sends chapter transcripts to Microsoft's online speech service using the third-party `edge-tts` client. It stages the returned audio, converts it locally to mono AAC/M4A at 44.1 kHz and 96 kbps, then copies completed files and creates the ZIP. Internet access is required for generation, with no API key. App playback uses the bundled recordings and does not contact the service.

`NARRATION_VOICE` and `NARRATION_RATE` optionally select another online voice and relative speaking rate (signed percentage, such as `-5%`). `NARRATION_PYTHON` selects another interpreter with `edge-tts` installed. Directory discovery picks up added or renamed audio paths after the manifest is updated; no import registry needs editing. The macOS `say` generator has been replaced; no system text-to-speech is used.
