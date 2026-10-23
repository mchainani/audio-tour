import { useMemo } from 'react';

import type { Tour } from '@/features/tours/types';

import { MapPreview } from './map-preview';

interface TourMapProps {
  readonly tour: Tour;
}

export function TourMap({ tour }: TourMapProps) {
  const stops = useMemo(() => tour.chapters.map((chapter, index) => ({
    location: chapter.location,
    label: `Chapter ${index + 1}: ${chapter.title}`,
    href: `/tours/${tour.id}/chapters/${chapter.id}`,
    number: index + 1,
  })), [tour.id, tour.chapters]);

  return <section className="tour-map-section" aria-labelledby="tour-map-heading">
    <div><h2 id="tour-map-heading">Explore the stops.</h2><p className="muted small">Numbers match the chapters below. The walking route follows streets and paths in chapter order. Select a pin, then follow its chapter link.</p></div>
    <MapPreview stops={stops} label={`Chapter locations and walking route in chapter order for ${tour.title}`} overview showRoute fallbackMessage="Map unavailable. Chapter locations are listed below." />
  </section>;
}
