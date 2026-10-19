import { ExternalLink } from 'lucide-react';
import { useRef } from 'react';

import { Eyebrow } from '@/components/ui';
import type { ChapterLocation } from '@/features/tours/types';

import { ChapterMap } from './chapter-map';
import { mapLinks } from './map-links';

export function ChapterLocationPanel({ location }: { readonly location: ChapterLocation }) {
  const chooser = useRef<HTMLDialogElement>(null);
  const links = mapLinks(location);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return <aside className="location-panel" aria-label="Chapter location">
    <Eyebrow>THIS STOP</Eyebrow>
    <ChapterMap key={`${location.latitude},${location.longitude}`} location={location} />
    <h3 className="stop-name">{location.name}</h3>
    <p className="coordinates">{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
    {isIOS ? <button className="button map-button" aria-label={`Open ${location.name} in Maps`} onClick={() => chooser.current?.showModal()}><ExternalLink size={17} aria-hidden="true" />Open in Maps</button>
      : <a className="button map-button" aria-label={`Open ${location.name} in Maps`} href={links.googleWeb} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} aria-hidden="true" />Open in Maps</a>}
    <dialog ref={chooser} className="maps-dialog" aria-labelledby="maps-dialog-title">
      <h2 id="maps-dialog-title">Open in Maps</h2><p>{location.name}</p>
      <a className="button" href={links.apple} target="_blank" rel="noopener noreferrer" onClick={() => chooser.current?.close()}>Apple Maps</a>
      <a className="button" href={links.googleWeb} target="_blank" rel="noopener noreferrer" onClick={() => chooser.current?.close()}>Google Maps</a>
      <button className="button" onClick={() => chooser.current?.close()}>Cancel</button>
    </dialog>
  </aside>;
}
