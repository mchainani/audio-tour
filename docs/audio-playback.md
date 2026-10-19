# Browser audio playback

Audio Tour uses the browser's HTML audio API through one shared `AudioPlayback` controller. React subscribes with `useSyncExternalStore`.

- No media element or source is created before Play. Vite imports external asset URLs without downloading the recordings.
- Play resolves one chapter source synchronously within the user gesture. The element uses `preload="none"`; playback starts its download.
- Play/pause, replay, ±15-second skips, and seeking share the same controller. Seeks clamp to duration. The range input supports arrows, PageUp/PageDown, Home, and End.
- Speed starts at 1× and offers 0.5×, 0.75×, 1×, 1.25×, and 1.5×. The controller enables browser pitch preservation. Rate changes while paused retain position and never autoplay.
- Leaving a chapter pauses and releases its audio, removes listeners, and resets position/duration while preserving session speed. Late events and rejected promises from the released element cannot update the next chapter.
- Loading and playback failures show a recoverable error and Retry. Retry requests the source again at the chosen rate. The transcript remains available.
- Media Session metadata/actions are registered when supported by the browser. Background playback and lock-screen controls depend on the browser; Safari/iOS behavior needs device testing.

Run `npm test` for controller lifecycle tests. The fake media adapter uses real events to exercise the controller; actual decoding and autoplay restrictions are covered by browser walkthroughs.
