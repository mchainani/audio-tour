# Audio tour app — proposed design

Status: initial design approved on 2026-10-18. Expo scaffolding, browser navigation, tour types, chapter audio playback, and the narrated San Francisco sample are implemented. The user requested audio and San Francisco narration as the next increment. Imports, persistent storage, live maps, the Golden Gate Park sample, and native device verification remain subsequent stages.

## Goal

Build a small application for importing, storing, browsing, and listening to audio tours. Develop and test it in a browser on a MacBook, then run the same project as a native iPhone app. The browser build is a supported development target; native audio behavior must also be verified on iOS.

## Framework decision

Recommended: React Native with Expo and TypeScript, using Expo Router for navigation and expo-audio for playback.

| Option | Mac testing | iPhone | Trade-off |
| --- | --- | --- | --- |
| Expo / React Native | Local browser and iOS simulator | Native app | Shared UI and application logic; maps and persistence need platform adapters. |
| Flutter | Browser, simulator, or native macOS | Native app | Capable alternative, but introduces Dart and another toolchain. |
| SwiftUI | Native macOS or iOS simulator | Native app | Strong Apple integration; does not provide a browser application. |

The user selected browser testing followed by a native iPhone app. Expo fits that choice. Node.js and npm are available, and Xcode is installed. Simulator availability has not been verified outside the sandbox.

## First version

### Screens and navigation

1. **Tour library:** list registered tours with title, introduction excerpt, and chapter count. Provide an import action and a useful empty state.
2. **Tour details:** show title, introduction, language, optional author, and ordered chapters. Selecting a chapter opens its player.
3. **Chapter:** show title, location name, audio player, full transcript, and a map marker. Provide previous/next chapter controls and a route back to the tour.

Use a readable, responsive layout: a single column on a phone, with more space for transcript and map in a desktop browser.

### Audio

Use expo-audio for play/pause, seeking, elapsed time, and duration. Maintain one active player so changing chapters stops the previous chapter. Do not autoplay when a tour is imported or a screen first opens. Display clear loading and playback errors.

Configure the native app for playback with the silent switch enabled and for background playback. Verify screen locking and background behavior in an iOS development build on a device; browser tests cannot establish those behaviors.

### Maps

Use Leaflet with an attributed OpenStreetMap tile source on web, and react-native-maps with Apple Maps on iOS. Hide platform differences behind one chapter-map interface. Display the chapter's latitude/longitude and location name, with a fallback when map tiles cannot load.

Only the supplied chapter locations are needed. Live user location, location permission, navigation, and automatic playback triggered by GPS are outside the first version. Online map tiles require connectivity; offline maps are a later feature.

### Tour storage and import

Start with an on-device library. “Upload” means selecting and importing a tour package into this installation, rather than uploading it to a remote service.

A tour is a ZIP file containing a versioned `tour.json` manifest and its audio files. This keeps narration and metadata together and avoids depending on external audio URLs. Include a documented package example and downloadable sample ZIPs in the repository.

Manifest fields:

- `schemaVersion`: `1`.
- `id`: stable, unique tour identifier.
- `title`, `intro`, and `language`: required text.
- `author`: optional text.
- `chapters`: a nonempty ordered array.
- Each chapter: unique `id`, `title`, `location` (`name`, `latitude`, `longitude`), plain-text `transcript`, and package-relative `audio` path.

Validate the entire package before registering it: manifest version and field types, nonempty required text, unique chapter IDs, coordinate ranges, safe relative paths, supported audio extensions, and presence of every referenced audio file. Define import size limits during implementation and document them. Reject duplicate tour IDs with a clear message. A failed import must not leave a partial tour in the library.

Keep storage behind a repository interface with operations to list tours, read a tour, import a package, and resolve chapter audio. Use IndexedDB for browser metadata and audio blobs. Use the app document directory for native audio and persistent metadata on iOS. Browser storage remains subject to browser data-clearing and eviction policies.

Successfully imported tours and their audio must survive an ordinary page refresh or app restart and play without network access. Native and browser storage are separate libraries; importing on one does not sync to the other.

### Sample tours

Create two short, original sample tours, each with three chapters:

1. **San Francisco waterfront:** Ferry Building, Pier 7, and the Exploratorium exterior.
2. **Golden Gate Park introduction:** Conservatory of Flowers, Music Concourse, and Blue Heron Lake.

Each chapter includes a brief transcript, a real map coordinate, and audible narration. At the user's request, the original macOS system voice was replaced with Microsoft's online Ava neural voice, an American female narrator; the user explicitly approved sending these sample transcripts to that service. Label the narration as synthesized demo audio. Keep factual claims conservative and exclude time-sensitive opening hours, prices, and access promises.

Provide both unpacked source packages and ready-to-import ZIPs, plus a repeatable generation command. Keep samples separate from the library so the import flow can be tested end to end.

## Boundaries

The first version does not include accounts, a backend, cross-device synchronization, a tour authoring interface, recording, payments, GPS triggers, offline map downloads, or App Store distribution. These can be added without changing the basic tour/chapter structure.

## Delivery sequence

1. Review this design and confirm the framework and meaning of import/upload.
2. Scaffold the Expo TypeScript project with browser and iOS targets, navigation, and documented local startup.
3. Implement manifest validation, platform storage, and package import.
4. Implement library and detail screens, chapter playback, transcripts, and platform maps.
5. Generate the two sample tour packages and test imports with real audio.
6. Run the appropriate automated checks and browser walkthrough; document the iPhone development and verification steps.

## Verification and acceptance

- Type checking and focused tests cover manifest validation, malformed imports, duplicate IDs, missing audio, and repository behavior.
- Open the app in a local browser, import both sample ZIPs, inspect the library and chapter ordering, and verify transcript and map coordinates.
- Play, pause, seek, and switch chapters; confirm only one chapter plays at a time.
- Reload and confirm imported tours persist. Confirm imported narration and transcripts remain available without network access, with a clear map fallback.
- Run an iOS development build when the native toolchain is available. Verify import, persistent storage, Apple Maps, silent-switch playback, background playback, and screen-lock behavior on an iPhone.
- Report browser and native verification separately. A successful web build is not evidence that the native app has passed device testing.

## References

- Expo web workflow: https://docs.expo.dev/workflow/web/
- Expo audio: https://docs.expo.dev/versions/latest/sdk/audio/
- Expo react-native-maps integration: https://docs.expo.dev/versions/latest/sdk/map-view/
