import { useMemo } from 'react';

import type { Tour } from '@/features/tours/types';

import { MapPreview } from './map-preview';

export function LibraryMap({ tours }: { readonly tours: readonly Tour[] }) {
  const stops = useMemo(() => tours.map((tour, index) => ({
    location: tour.location,
    label: `Tour ${index + 1}: ${tour.title}`,
    number: index + 1,
  })), [tours]);
  if (tours.length === 0) return null;

  return <section className="tour-map-section" aria-labelledby="library-map-heading">
    <div><h2 id="library-map-heading">Find your next walk.</h2><p className="muted small">Numbers match the tours below. Select a pin to see its tour and city.</p></div>
    <MapPreview stops={stops} label="Tour locations" overview fallbackMessage="Map unavailable. Browse the tours below." />
  </section>;
}
