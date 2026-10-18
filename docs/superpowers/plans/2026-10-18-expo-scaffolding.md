# Expo Scaffolding Implementation Plan

> **For agentic workers:** Execute inline with the executing-plans workflow. The user has approved building the initial scaffolding in this checkout.

**Goal:** Create a runnable Expo TypeScript foundation, preview navigation, and documented browser development workflow.

**Architecture:** Expo Router owns library, tour, and chapter routes. Read-only preview metadata implements the approved tour types. Shared presentation components keep screen layout consistent across web and iOS, without implementing persistence, import, playback, or maps in this stage.

**Tech Stack:** Expo, React Native, TypeScript, Expo Router, React Native Web, npm, ESLint.

**Spec:** `docs/superpowers/specs/2026-10-18-audio-tour-design.md`

## Global constraints

- Browser testing comes first; keep iOS configuration and React Native-compatible components.
- Preserve schema version 1: tour ID, title, intro, language, optional author, ordered chapters with ID, title, named coordinates, transcript, and package-relative audio path.
- Preview data is bundled development content, not an imported or persistent tour library.
- Audio controls and maps must clearly communicate that they are not connected.
- ZIP imports, persistent storage, narrated sample packages, and live maps are outside this scaffolding request.
- Verify configuration and presentation using type checking, lint, a production web export, and an actual browser walkthrough. Do not add implementation-mirroring tests for scaffold configuration.

## Task 1: Generate and configure Expo

**Files:** `package.json`, `package-lock.json`, `app.json`, `tsconfig.json`, `eslint.config.js`, `.gitignore`, `assets/`.

**Interfaces:** Produces an Expo Router entry point and scripts `start`, `web`, `ios`, `android`, `typecheck`, `lint`, and `build:web`.

- [x] Generate the official blank TypeScript starter in a temporary directory and copy generated files without replacing `.git` or `docs`.
- [x] Install SDK-compatible web and router packages using `npx expo install`.
- [x] Set `main` to `expo-router/entry`; configure the app name, URL scheme, iOS identifier, and Metro web bundling.
- [x] Use strict TypeScript, the Expo ESLint configuration, and an npm lockfile. Ignore dependency, Metro, export, and local environment artifacts.
- [x] Verify dependency compatibility with `npx expo install --check`.

## Task 2: Add tour types and preview navigation

**Files:** `src/features/tours/types.ts`, `src/features/tours/preview-tours.ts`, `src/components/`, `src/theme.ts`, `app/_layout.tsx`, `app/index.tsx`, `app/tours/[tourId]/index.tsx`, `app/tours/[tourId]/chapters/[chapterId].tsx`, `app/+not-found.tsx`.

**Interfaces:** `Tour` and `Chapter` are readonly version 1 schema types. `previewTours` is a readonly array of `Tour`. Routes use stable tour/chapter IDs and show an explicit not-found state for unknown IDs.

- [x] Define the approved schema as readonly TypeScript interfaces; export `Tour`, `Chapter`, and `ChapterLocation`.
- [x] Add one clearly labeled preview tour containing three chapter metadata records with package-relative audio paths. Audio files are intentionally absent until the sample-content stage.
- [x] Build an accessible responsive library, tour overview, and chapter screen using React Native components and typed Expo Router links.
- [x] Show chapter transcript and coordinates; render honest audio/map placeholders with no fake playback behavior.
- [x] Add explicit navigation back to the library/tour and route handling for unknown tour/chapter IDs.
- [x] Run `npm run typecheck`, `npm run lint`, and `npm run build:web`.

## Task 3: Document and verify the developer experience

**Files:** `README.md`, `docs/tour-format.md`, `docs/superpowers/plans/2026-10-18-expo-scaffolding.md`.

**Interfaces:** A new developer can run `npm ci` and `npm run web`; schema documentation matches exported types.

- [x] Document Node requirements, startup commands, directory structure, completed scaffold behavior, and deferred features.
- [x] Include a complete illustrative `tour.json` in the format documentation and explain that sample audio packages are not yet generated.
- [x] Start Metro on localhost and inspect the app in a browser. Verify library → tour → chapter navigation, direct route loading, unknown IDs, and a narrow viewport.
- [x] Inspect the final diff and ensure web artifacts and dependencies are ignored.
- [x] Record verification results and clearly separate browser verification from unperformed native device testing.


## Verification record — 2026-10-18

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build:web`: passed; production output is ignored in `dist/`.
- `npx expo install --check`: dependency versions compatible with SDK 58.
- `npx expo-doctor`: all 20 checks passed after the compatible dependency update.
- Browser walkthrough: library → tour → all three chapters; previous/next controls; direct chapter URL and reload; missing tour, chapter, and route fallback screens.
- Responsive checks: library and chapter at 390 × 844; document width remained 390px with no horizontal overflow. Temporary viewport override reset afterward.
- Browser console: no application errors observed. A Metro disconnection warning occurred during the intentional development-server restart.
- Read-only code review: no blocking findings. Corrected optional-author rendering and Node engine compatibility range.
- Screenshot: `docs/screenshots/scaffold-library.jpg`.
- Development server left running at `http://localhost:8081` with live reload enabled.
- Native device/simulator behavior was not tested. Import, persistence, playback, and live map acceptance checks belong to later stages.
- Dependency audit: 26 remaining upstream/transitive advisories after compatible fixes; details and deployment caveat in `README.md`.
