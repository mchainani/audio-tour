import { useMemo } from 'react';

import type { ChapterLocation } from '@/features/tours/types';

import { MapPreview } from './map-preview';

export function ChapterMap({ location }: { readonly location: ChapterLocation }) {
  const stops = useMemo(() => [{ location, label: location.name }], [location]);
  return <MapPreview stops={stops} label={`Map of ${location.name}`} />;
}
