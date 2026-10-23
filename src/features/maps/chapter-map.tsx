import { useMemo } from 'react';

import type { ChapterLocation } from '@/features/tours/types';

import { MapPreview } from './map-preview';

interface ChapterMapProps {
  readonly location: ChapterLocation;
}

export function ChapterMap({ location }: ChapterMapProps) {
  const stops = useMemo(() => [{ location, label: location.name }], [location]);
  return <MapPreview stops={stops} label={`Map of ${location.name}`} />;
}
