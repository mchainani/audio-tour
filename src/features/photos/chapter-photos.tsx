import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

import './chapter-photos.css';

function Photo({ src, alt }: { readonly src: string; readonly alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <p className="chapter-photo-unavailable" role="status">Photo unavailable.</p>
    : <img src={src} alt={alt} draggable={false} loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

export function ChapterPhotos({ images, locationName }: { readonly images: readonly string[]; readonly locationName: string }) {
  const [selected, setSelected] = useState(0);
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  if (images.length === 0) return null;
  const index = selected % images.length;
  const multiple = images.length > 1;
  function move(direction: number) {
    setSelected((current) => (current + direction + images.length) % images.length);
  }

  return <section className="chapter-photos" role="region" aria-roledescription="carousel" aria-label={`${locationName} photos`}
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
      <Photo key={images[index]} src={images[index]} alt={`${locationName}, photo ${index + 1} of ${images.length}`} />
    </div>
    {multiple && <div className="chapter-photo-controls">
      <button type="button" aria-label="Previous photo" onClick={() => move(-1)}><ChevronLeft size={20} aria-hidden="true" /></button>
      <p className="chapter-photo-count" aria-live="polite" aria-atomic="true">Photo {index + 1} of {images.length}</p>
      <button type="button" aria-label="Next photo" onClick={() => move(1)}><ChevronRight size={20} aria-hidden="true" /></button>
    </div>}
  </section>;
}
