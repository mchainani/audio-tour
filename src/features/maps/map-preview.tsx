import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

import type { MapLocation } from '@/features/tours/types';

import { loadWalkingRoute } from './walking-route';

import './chapter-map.css';

export interface MapStop {
  readonly location: MapLocation;
  readonly label: string;
  readonly href?: string;
  readonly number?: number;
}

interface MapPreviewProps {
  readonly stops: readonly MapStop[];
  readonly label: string;
  readonly overview?: boolean;
  readonly showRoute?: boolean;
  readonly fallbackMessage?: string;
}

export function MapPreview({ stops, label, overview = false, showRoute = false, fallbackMessage = 'Map unavailable. Check your connection or open Maps below.' }: MapPreviewProps) {
  const container = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [routeState, setRouteState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    let map: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    let tilesLoaded = 0;
    const routeController = new AbortController();
    const timeout = setTimeout(() => {
      if (active && tilesLoaded === 0) setState('error');
    }, 12000);

    import('leaflet').then((L) => {
      if (!active || !container.current || stops.length === 0) return;
      map = L.map(container.current, { scrollWheelZoom: false });
      const coordinates = stops.map(({ location }): [number, number] => [location.latitude, location.longitude]);
      const bounds = L.latLngBounds(coordinates);
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
      if (showRoute && coordinates.length > 1) {
        setRouteState('loading');
        map.attributionControl.addAttribution('Routing: <a href="https://routing.openstreetmap.de/about.html">OSRM</a> · <a href="https://www.openstreetmap.org/fixthemap">Fix the map</a>');
        void loadWalkingRoute(stops.map(({ location }) => location), routeController.signal).then((route) => {
          if (!active || !map) return;
          const line = L.polyline(route, {
            color: '#244f3d',
            weight: 4,
            opacity: 0.85,
            interactive: false,
          }).addTo(map);
          bounds.extend(line.getBounds());
          map.fitBounds(bounds, { padding: [36, 42], maxZoom: 16 });
          setRouteState('ready');
        }).catch(() => {
          if (active) setRouteState('error');
        });
      }
      for (const stop of stops) {
        const pin = document.createElement('span');
        pin.setAttribute('aria-hidden', 'true');
        if (stop.number !== undefined) pin.textContent = String(stop.number);
        const popup = document.createElement('div');
        const heading = document.createElement('strong');
        if (stop.href) {
          const link = document.createElement('a');
          link.href = stop.href;
          link.textContent = stop.label;
          heading.append(link);
        } else {
          heading.textContent = stop.label;
        }
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
      routeController.abort();
      clearTimeout(timeout);
      observer?.disconnect();
      map?.remove();
    };
  }, [stops, attempt, overview, showRoute]);

  return <div className={`chapter-map-frame${overview ? ' tour-map-frame' : ''}`}>
    <div ref={container} className="chapter-map-canvas" role="region" aria-label={label} />
    {state !== 'ready' && <div className="chapter-map-status" role="status">
      {state === 'loading' ? 'Loading map…' : <>{fallbackMessage} <button type="button" onClick={() => { setState('loading'); setAttempt((value) => value + 1); }}>Retry map</button></>}
    </div>}
    {state === 'ready' && showRoute && stops.length > 1 && routeState !== 'ready' && <div className="chapter-map-status" role="status">
      {routeState === 'loading' ? 'Loading walking route…' : <>Walking route unavailable. You can still explore the chapter pins. <button type="button" onClick={() => { setRouteState('loading'); setState('loading'); setAttempt((value) => value + 1); }}>Retry route</button></>}
    </div>}
  </div>;
}
