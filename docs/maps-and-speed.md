# Web maps and speed

All map previews use Leaflet/OpenStreetMap on every device. The preview shows the chapter marker, keyboard/pan/zoom controls, and tile attribution. Scroll-wheel zoom is disabled to avoid trapping page scroll. Map loading is independent of narration.

The library map shows one numbered pin per registered tour using its top-level city `location`. Numbers match the displayed, alphabetically sorted tour cards, starting at 1. Cards show the city name and their matching number. Pin popups show the tour title as a hyperlink to its tour page, with the city underneath; the map frames all tours and refits after resizing. An empty library omits the map, and a failed map leaves all tour cards available.

Tour details include an overview map above the chapter list. Each stop has a numbered pin matching its chapter's position in the manifest, starting at 1. The map frames all chapter coordinates on initial load and when resized, with a maximum zoom for single-stop tours. Selecting a pin by click, tap, or Enter shows its chapter title as a hyperlink to the corresponding chapter page, with the location underneath. A failed overview map keeps the chapter list accessible below.

Failed or timed-out tiles show an unavailable message and Retry. The stop name, coordinates, and external maps button remain available. No listener location or location permission is required.

Desktop opens a Google Maps coordinate link in a new tab. iPhone/iPad browsers offer Apple Maps and Google Maps in a standard modal dialog, with Escape/Cancel and browser-managed focus. These are web links; iOS controls whether an installed app handles them.

The accessible speed radio inputs support Tab, arrows, and Space. Speeds are 0.5×–1.5×, default 1×, retained across chapters until page reload. See [audio behavior](audio-playback.md).
