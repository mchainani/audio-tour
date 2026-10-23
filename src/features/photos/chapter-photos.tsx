import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducer, useRef } from 'react';

import { Eyebrow } from '@/components/ui';

import { photoCarouselReducer } from './photo-carousel-state';

import './chapter-photos.css';

interface ChapterPhotosProps {
  readonly images: readonly string[];
  readonly locationName: string;
}

export function ChapterPhotos({ images, locationName }: ChapterPhotosProps) {
  const [state, dispatch] = useReducer(photoCarouselReducer, { images, selected: 0 });
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const photos = state.images;
  if (photos.length === 0) return null;
  const src = photos[state.selected];
  const multiple = photos.length > 1;
  function move(direction: number) {
    dispatch({ type: 'move', direction });
  }

  return <section className="photo-panel" aria-label="Chapter photos">
    <Eyebrow>PHOTOS</Eyebrow>
    <section className="chapter-photos" role="region" aria-roledescription="carousel" aria-label={`${locationName} photos`}
      tabIndex={multiple ? 0 : undefined}
      onKeyDown={(event) => {
        if (!multiple || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
        event.preventDefault();
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }}>
      <div className="chapter-photo-frame"
        onPointerDown={(event) => {
          if (!multiple || !event.isPrimary || event.button !== 0) return;
          gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          const start = gesture.current;
          gesture.current = null;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { gesture.current = null; }}
        onLostPointerCapture={() => { gesture.current = null; }}>
        <img key={src} src={src} alt={`${locationName}, photo ${state.selected + 1} of ${photos.length}`} draggable={false} loading="lazy" decoding="async"
          onError={() => dispatch({ type: 'failed', src })} />
      </div>
      {multiple && <div className="chapter-photo-controls">
        <button type="button" aria-label="Previous photo" onClick={() => move(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
        <p className="chapter-photo-count" aria-live="polite" aria-atomic="true">Photo {state.selected + 1} of {photos.length}</p>
        <button type="button" aria-label="Next photo" onClick={() => move(1)}><ChevronRight size={20} aria-hidden="true" /></button>
      </div>}
    </section>
  </section>;
}
