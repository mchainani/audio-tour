import { useMemo } from 'react';

import type { Tour } from '@/features/tours/types';

import { MapPreview } from './map-preview';

interface LibraryMapProps {
  readonly tours: readonly Tour[];
}

export function LibraryMap({ tours }: LibraryMapProps) {
  const stops = useMemo(() => tours.map((tour, index) => ({
    location: tour.location,
    label: `Tour ${index + 1}: ${tour.title}`,
    href: `/tours/${tour.id}`,
    number: index + 1,
  })), [tours]);
  if (tours.length === 0) return null;

  return <section className="tour-map-section" aria-labelledby="library-map-heading">
    <div><h2 id="library-map-heading">Find your next walk.</h2><p className="muted small">Numbers match the tours below. Select a pin, then follow its tour link.</p></div>
    <MapPreview stops={stops} label="Tour locations" overview fallbackMessage="Map unavailable. Browse the tours below." />
  </section>;
}
