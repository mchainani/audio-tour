# Audio Tour

A React Native app built with Expo and TypeScript. Develop in a browser on your Mac, then run the same project on an iPhone.

This is the **initial scaffold**, with a responsive library, tour overview, chapter navigation, transcript preview, and version 1 tour types. The bundled waterfront tour is read-only preview data. Audio playback, live maps, ZIP imports, persistent storage, and narrated sample packages are the next stage.

## Run locally

Use Node.js 24 LTS, version 24.3 or later (see `.nvmrc`), and npm. From the project directory:

```sh
npm ci
npm run web
```

Expo starts the development server, normally at **http://localhost:8081**. Open the URL printed in the terminal. Source changes refresh automatically. Stop the server with `Ctrl+C`.

Select **San Francisco waterfront**, then choose a chapter to preview its transcript and location coordinates. Test a phone-sized layout by narrowing the browser or using its responsive design mode.

The current app requires no account, API key, backend, or environment variables. Only development preview data is bundled; nothing is imported or saved yet.

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
| `npx expo install --check` | Check dependency compatibility with the installed Expo SDK |

The web export is a single-page app. When hosting it, rewrite non-asset routes to `index.html` so direct tour/chapter links work. The Expo development server already handles this.

## Project structure

```text
app/
  _layout.tsx                         Root navigation and status bar
  index.tsx                          Tour library
  tours/[tourId]/index.tsx            Tour overview
  tours/[tourId]/chapters/[chapterId].tsx
  +not-found.tsx                      Unknown-route screen
src/
  components/                        Shared page layout and presentation
  features/tours/types.ts             Readonly version 1 tour schema
  features/tours/preview-tours.ts      Bundled navigation fixture, without audio assets
  theme.ts                           Shared colors and typography
docs/
  tour-format.md                     Manifest example and field definitions
  superpowers/specs/                  Approved design and stage boundaries
  superpowers/plans/                  Scaffolding checklist
```

## iPhone, later

The project includes iOS configuration and uses React Native components throughout. For an early device preview, run `npm start`, use Expo Go on the same network, and scan the development QR code, provided the installed Expo Go release supports this project's SDK. The iOS simulator is another option.

Use an iOS development build for testing native configuration and background audio when those features are added. Browser verification does not verify native imports, file storage, maps, or lock-screen behavior. App signing and distribution will be configured at that stage; the current bundle identifier is a development placeholder.

## Next stages

1. Validate and import ZIP packages, with persistent browser/iPhone storage.
2. Connect chapter audio playback and web/native maps.
3. Generate two original sample tour packages with narrated audio.
4. Verify the native experience on an iPhone.

See [the approved design](docs/superpowers/specs/2026-10-18-audio-tour-design.md) and [tour format](docs/tour-format.md).

## Dependency audit

On 2026-10-18, `npm audit` reports 26 advisories (19 high, 7 moderate) in the Expo/React Native dependency tree, originating from `braces`, `node-forge`, and `uuid`. Compatible fixes were applied; the reported remaining fix requires downgrading to Expo 44 and would break this SDK 58 scaffold. Keep the development server local and recheck upstream dependency updates before deployment.
