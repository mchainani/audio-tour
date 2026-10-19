# Audio Tour

A React web app built with TypeScript and Vite. Run it in a browser on your Mac or iPhone.

The app includes a responsive tour library with a numbered city map, tour details with numbered chapter maps, chapter navigation, transcripts, optional photo carousels, optional audio playback with speed controls, and interactive maps. San Francisco waterfront has three chapters; New York City's Lower Manhattan tour has five. Their sample recordings use synthesized Ava narration. The 13-chapter [Buenos Aires & Tigre tour](tours/buenos-aires/README.md) includes Andrew narration for all 13 chapters. The public app presents tours bundled during deployment; publishing tour artifacts is handled from this repository.

## Run on your Mac

Use Node.js 24 LTS (see `.nvmrc`) and npm:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. Source changes refresh automatically. Stop the server with Ctrl+C. `npm start` and `npm run web` are aliases for the same Vite development server.

## Test on your iPhone

1. Connect your Mac and iPhone to the same Wi-Fi network.
2. Start Vite with local-network access:
   ```sh
   npm run dev -- --host 0.0.0.0
   ```
3. Open the Network URL printed by Vite in Safari on your iPhone, such as `http://192.168.1.20:5173`. The phone needs your Mac's network address; `localhost` on the phone refers to the phone.
4. Keep your Mac and server running during testing. Safari's Share → Add to Home Screen can save a shortcut.

A deployed HTTPS site can be used in Safari without the Mac running. Offline use is not implemented. Background playback, lock-screen controls, and app handoff depend on Safari/iOS; test those on the device.

## Playback and maps

Chapters without `audio` show their transcript and map without loading the player component. For chapters with audio, press Play to load the narration. Browse tours and change speed without fetching audio. Controls include play/pause, replay, ±15 seconds, a seek timeline, elapsed time, and duration. Keyboard seeking supports arrows, PageUp/PageDown, and Home/End.

Speed options are **0.5×, 0.75×, 1×, 1.25×, and 1.5×**, with pitch correction. Speed defaults to 1× and stays selected across chapters until the page reloads. Leaving a chapter stops playback, clears the source, and resets its position. Transcripts remain readable during media errors, and Retry reloads the audio.

Leaflet/OpenStreetMap previews each chapter's stored coordinates. Tiles require internet access, but coordinates and the **Open in Maps** link remain available if the preview fails. Desktop opens Google Maps in a new tab. iPhone browsers offer Apple Maps or Google Maps; iOS decides whether a web link opens an installed app or its website. No location permission or API key is needed.

See [audio behavior](docs/audio-playback.md) and [map behavior](docs/maps-and-speed.md).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` / `npm start` / `npm run web` | Start Vite on port 5173 |
| `npm run build` / `npm run build:web` | Type-check and build the static site in `dist/` |
| `npm run preview` | Serve the production build at http://127.0.0.1:4173 |
| `npm run typecheck` | Check TypeScript |
| `npm run lint` | Run ESLint |
| `npm test` | Test browser playback lifecycle, catalog validation, Vite discovery, and map links |
| `npm run generate:audio` | Regenerate configured chapter narration and tour ZIPs on macOS; skip chapters without audio paths |
| `npm run generate:audio -- new-york-city` | Regenerate only the New York tour |

## Project structure

```text
index.html                         Browser entry
vite.config.ts                     Build configuration
src/
  main.tsx                         React root, router, shared audio session
  app.tsx                          Library, tour, chapter, and missing-page routes
  styles.css                       Responsive HTML/CSS presentation
  pages/                           Library, tour overview, chapter
  components/                      Page shell and shared UI
  features/audio/                  HTML audio controller and accessible controls
  features/photos/                 Optional swipeable chapter photo carousel
  features/maps/                   Leaflet preview and external maps chooser
  features/tours/                  Manifest discovery, validation, and media lookup
tours/
  buenos-aires/                    Original scripts and Andrew narration
    tour.json
    transcripts/                   One UTF-8 .txt file per chapter
    SOURCES.md
    NARRATION.md
    README.md
    audio/
  san-francisco-waterfront/
    tour.json
    transcripts/
    audio/
    san-francisco-waterfront.zip
  new-york-city/
    tour.json
    transcripts/
    audio/
    new-york-city.zip
tests/                             Node unit tests and Vite catalog integration
scripts/                           Existing narration generator
docs/                              Tour schema and playback/maps notes
```

## Add a tour

Create a direct subdirectory of `tours/`:

```text
tours/your-tour/tour.json
tours/your-tour/transcripts/first-stop.txt
tours/your-tour/audio/first-stop.m4a
tours/your-tour/images/first-stop-front.jpg   # optional photos
```

Use the [version 1 schema](docs/tour-format.md), unique tour/chapter IDs, and safe relative file paths. Set each chapter's `transcript` to a reference such as `transcripts/first-stop.txt`, with one nonblank UTF-8 plain text file per chapter inside that tour's `transcripts/` directory. Separate paragraphs with a blank line. Chapter `audio` is optional: omit it to publish the transcript and map without playback controls. The catalog validates metadata, coordinates, duplicate IDs, and safe reference paths. Missing audio displays **Audio not available**; missing or blank transcripts display **Transcript not available** without preventing tours from loading. Playback failures replace the controls with the audio message and a Retry button. Missing photos are skipped; photos that fail in the browser are removed from the carousel. If no photos remain, the photo section disappears. Manifest structure errors identify the manifest to fix. M4A, MP3, and WAV are supported for audio. Optionally add an ordered `images` array of safe paths under this tour’s `images/` directory, such as `["images/first-stop-front.jpg", "images/first-stop-detail.jpg"]`. JPEG, PNG, WebP, and AVIF photos are supported. Chapters with photos show one at a time in the separate **PHOTOS** section, with left/right swipe, buttons, and arrow-key navigation. Omit `images` or use `[]` to hide the carousel.

Vite discovers manifests automatically, without a manual registry. Refresh after adding a complete tour. Published sites need a rebuild to include source-directory changes; browsers do not read arbitrary Mac directories at runtime. Audio files are emitted as separate assets and fetched only on Play/Retry. Photos are separate assets loaded as they are displayed in the chapter carousel. ZIP import and persistent tour storage are not implemented.

## Build and host

```sh
npm run build
npm run preview
```

Deploy `dist/` to a static host at the site root. Configure a single-page-app fallback: non-asset paths such as `/tours/new-york-city/chapters/the-battery` must serve `index.html`. Vite's development and preview servers already do this. Serve audio files with their proper media content types; byte-range support is recommended for seeking. Use HTTPS for a public deployment.

### Cloudflare Pages

Production: **https://audio-tour.pages.dev/**. Open this HTTPS URL directly on your iPhone; the Mac does not need to remain running.

From the project root, with Cloudflare authenticated, publish the current source:

```sh
npm run build
npx --yes wrangler@4.151.1 pages deploy dist --project-name audio-tour --branch main --commit-dirty=true
```

The Pages project uses `main` as its production deployment branch. Wrangler also bundles the `functions/` directory. Its audio handler supplies byte-range responses for seeking because the static Pages origin returned complete recordings for range requests. Keep `functions/` and `server/audio-ranges.mjs` alongside the app when redeploying. Pages serves the React entry point for direct tour/chapter URLs.

## Tour narration

Each tour directory contains its manifest and `transcripts/` files and may include recordings and a ZIP package. Each generated ZIP contains its tour's manifest, every referenced transcript file and photo, and configured recordings; the app reads the unpacked source files. The generator reads the file referenced by each chapter's `transcript` field as speech input. It skips narration for chapters that omit `audio` and skips packaging tours with no audio paths.

To regenerate on a Mac:

```sh
python3 -m venv .venv-audio
.venv-audio/bin/python -m pip install -r scripts/requirements-audio.txt
npm run generate:audio
```

The generic generator sends chapter transcripts to Microsoft's online speech service through the third-party `edge-tts` client, defaulting to **Ava** (`en-US-AvaNeural`, American female) at `-5%`. Buenos Aires uses **Andrew Multilingual** (`en-US-AndrewMultilingualNeural`); set `NARRATION_VOICE` accordingly to preserve that choice. It requires internet access. Only AAC conversion and ZIP packaging use macOS tools. Normal playback uses the existing files and makes no speech-service request. Overrides: `NARRATION_VOICE`, `NARRATION_RATE`, and `NARRATION_PYTHON`.
