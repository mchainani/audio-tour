# Audio Tour

A React Native app built with Expo and TypeScript. Develop in a browser on your Mac, then run the same project on an iPhone.

The app includes a responsive library, tour overview, chapter navigation, transcripts, and audio playback. The bundled San Francisco waterfront tour has three chapters with synthesized demo narration. Live maps, ZIP imports, and persistent storage are upcoming stages.

## Run locally

Use Node.js 24 LTS, version 24.3 or later (see `.nvmrc`), and npm. From the project directory:

```sh
npm ci
npm run web
```

Expo starts the development server, normally at **http://localhost:8081**. Open the URL printed in the terminal. Source changes refresh automatically. Stop the server with `Ctrl+C`.

Select **San Francisco waterfront**, then choose a chapter. Press Play to listen, pause, skip 15 seconds, or seek along the timeline. The browser timeline also supports arrow keys and Home/End. Chapter navigation pauses playback; chapters never autoplay. Test a phone-sized layout by narrowing the browser or using its responsive design mode.

The current app requires no account, API key, backend, or environment variables. The demo tour is bundled; nothing is imported or saved yet, and playback position resets when a chapter is reopened.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run web` | Develop in a local Mac browser |
| `npm start` | Start Expo and choose a platform |
| `npm run ios` | Open the app in the iOS simulator; requires Xcode and an installed simulator runtime |
| `npm run android` | Open the app in an Android emulator; requires Android tooling |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Run Expo's ESLint configuration |
| `npm run build:web` | Export a production web build into `dist/` |
| `npm run generate:audio` | Regenerate San Francisco narration and its ZIP on macOS |
| `npx expo install --check` | Check dependency compatibility with the installed Expo SDK |

The web export is a single-page app. When hosting it, rewrite non-asset routes to `index.html` so direct tour/chapter links work. The Expo development server already handles this.

## Project structure

```text
app/
  _layout.tsx                         Root navigation and shared audio session
  index.tsx                          Tour library
  tours/[tourId]/index.tsx            Tour overview
  tours/[tourId]/chapters/[chapterId].tsx
  +not-found.tsx                      Unknown-route screen
src/
  components/                        Shared page layout and presentation
  features/tours/types.ts             Readonly version 1 tour schema
  features/tours/preview-tours.ts      Bundled demo manifest
  features/tours/bundled-audio.ts      Static Metro audio asset resolution
  features/audio/                     Playback and platform seek controls
  theme.ts                           Shared colors and typography
samples/
  san-francisco-waterfront/           Manifest and three narrated M4A files
  san-francisco-waterfront.zip        Portable tour package for future import
scripts/
  generate-tour-audio.mjs             Cloud neural speech and macOS AAC conversion
  requirements-audio.txt             Pinned Python speech client
docs/
  tour-format.md                     Manifest example and field definitions
  audio-playback.md                  Playback behavior and verification
  superpowers/specs/                  Approved design and stage boundaries
  superpowers/plans/                  Scaffolding checklist
```

## iPhone, later

The project includes iOS configuration and uses React Native components throughout. For an early device preview, run `npm start`, use Expo Go on the same network, and scan the development QR code, provided the installed Expo Go release supports this project's SDK. The iOS simulator is another option.

Use an iOS development build to test the configured native silent-switch playback, background audio, and lock-screen controls. These require device validation; browser verification does not establish native behavior. App signing and distribution will be configured at that stage; the current bundle identifier is a development placeholder.

## Sample narration

[San Francisco waterfront ZIP](samples/san-francisco-waterfront.zip) contains `tour.json` and three AAC/M4A files, generated from the original chapter transcripts using Microsoft's online **Ava** neural voice (`en-US-AvaNeural`), an American female voice. The app bundles these same files. ZIP import is not yet available in the app.

To regenerate on a Mac, install the speech client once, then run:

```sh
python3 -m venv .venv-audio
.venv-audio/bin/python -m pip install -r scripts/requirements-audio.txt
npm run generate:audio
```

Generation sends chapter transcripts to Microsoft's online speech service through the third-party `edge-tts` client. It requires internet access, with no API key. The default rate is `-5%` for a slightly relaxed delivery. Optional overrides: `NARRATION_VOICE`, `NARRATION_RATE` (a signed percentage), and `NARRATION_PYTHON` (another Python interpreter with the client installed). Only AAC conversion and ZIP packaging use macOS tools (`afconvert` and `zip`); system speech voices are no longer used. Normal app playback uses the bundled files and makes no speech-service requests. See the [sample notes](samples/san-francisco-waterfront/README.md).

## Next stages

1. Validate and import ZIP packages, with persistent browser/iPhone storage.
2. Connect web/native maps.
3. Add the Golden Gate Park sample tour and verify sample package imports.
4. Verify the native experience on an iPhone.

See [the approved design](docs/superpowers/specs/2026-10-18-audio-tour-design.md) and [tour format](docs/tour-format.md).

## Dependency audit

On 2026-10-18, `npm audit` reports 26 advisories (19 high, 7 moderate) in the Expo/React Native dependency tree, originating from `braces`, `node-forge`, and `uuid`. Compatible fixes were applied; the reported remaining fix requires downgrading to Expo 44 and would break this SDK 58 scaffold. Keep the development server local and recheck upstream dependency updates before deployment.
