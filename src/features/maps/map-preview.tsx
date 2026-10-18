import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

import type { MapLocation } from '@/features/tours/types';

import './chapter-map.css';

export interface MapStop {
  readonly location: MapLocation;
  readonly label: string;
  readonly number?: number;
}

export function MapPreview({ stops, label, overview = false, fallbackMessage = 'Map unavailable. Check your connection or open Maps below.' }: { readonly stops: readonly MapStop[]; readonly label: string; readonly overview?: boolean; readonly fallbackMessage?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let map: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    let tilesLoaded = 0;
    const timeout = setTimeout(() => {
      if (active && tilesLoaded === 0) setState('error');
    }, 12000);

    import('leaflet').then((L) => {
      if (!active || !container.current || stops.length === 0) return;
      map = L.map(container.current, { scrollWheelZoom: false });
      const bounds = L.latLngBounds(stops.map(({ location }) => [location.latitude, location.longitude]));
      map.fitBounds(bounds, { padding: [36, 42], maxZoom: 16 });
      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      });
      tiles.on('tileload', () => {
        tilesLoaded += 1;
        if (active) setState('ready');
      });
      tiles.on('load', () => {
        if (active && tilesLoaded === 0) setState('error');
      });
      tiles.addTo(map);
      for (const stop of stops) {
        const pin = document.createElement('span');
        pin.setAttribute('aria-hidden', 'true');
        if (stop.number !== undefined) pin.textContent = String(stop.number);
        const popup = document.createElement('div');
        const heading = document.createElement('strong');
        heading.textContent = stop.label;
        popup.append(heading);
        if (stop.label !== stop.location.name) {
          const locationName = document.createElement('div');
          locationName.textContent = stop.location.name;
          popup.append(locationName);
        }
        const numbered = stop.number !== undefined;
        const marker = L.marker([stop.location.latitude, stop.location.longitude], {
          title: stop.label,
          icon: L.divIcon({
            className: numbered ? 'tour-map-marker' : 'chapter-map-marker',
            html: pin,
            iconSize: numbered ? [40, 44] : [28, 36],
            iconAnchor: numbered ? [20, 42] : [14, 36],
            popupAnchor: [0, -36],
          }),
        }).addTo(map).bindPopup(popup);
        marker.getElement()?.setAttribute('aria-label', stop.label);
      }
      observer = new ResizeObserver(() => {
        map?.invalidateSize();
        if (overview) map?.fitBounds(bounds, { padding: [36, 42], maxZoom: 16, animate: false });
      });
      observer.observe(container.current);
    }).catch((error: unknown) => {
      console.error('Could not initialize the map.', error);
      if (active) setState('error');
    });

    return () => {
      active = false;
      clearTimeout(timeout);
      observer?.disconnect();
      map?.remove();
    };
  }, [stops, attempt, overview]);

  return <div className={`chapter-map-frame${overview ? ' tour-map-frame' : ''}`}>
    <div ref={container} className="chapter-map-canvas" role="region" aria-label={label} />
    {state !== 'ready' && <div className="chapter-map-status" role="status">
      {state === 'loading' ? 'Loading map…' : <>{fallbackMessage} <button type="button" onClick={() => { setState('loading'); setAttempt((value) => value + 1); }}>Retry map</button></>}
    </div>}
  </div>;
}
