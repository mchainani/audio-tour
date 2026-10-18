import { useMemo } from 'react';

import type { Tour } from '@/features/tours/types';

import { MapPreview } from './map-preview';

export function TourMap({ tour }: { readonly tour: Tour }) {
  const stops = useMemo(() => tour.chapters.map((chapter, index) => ({
    location: chapter.location,
    label: `Chapter ${index + 1}: ${chapter.title}`,
    number: index + 1,
  })), [tour.chapters]);

  return <section className="tour-map-section" aria-labelledby="tour-map-heading">
    <div><h2 id="tour-map-heading">Explore the stops.</h2><p className="muted small">Numbers match the chapters below. Select a pin to see the stop.</p></div>
    <MapPreview stops={stops} label={`Chapter locations for ${tour.title}`} overview fallbackMessage="Map unavailable. Chapter locations are listed below." />
  </section>;
}
