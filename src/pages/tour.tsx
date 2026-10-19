import { ArrowRight, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { BackLink, Badge, Eyebrow, MissingContent } from '@/components/ui';
import { TourMap } from '@/features/maps/tour-map';
import { tours } from '@/features/tours/catalog';

export function TourPage() {
  const { tourId } = useParams();
  const tour = tours.find((entry) => entry.id === tourId);
  if (!tour) return <MissingContent title="Tour not found" />;
  return <>
    <BackLink to="/">Your tours</BackLink>
    <section className="tour-introduction">
      <Badge>{tour.chapters.some((chapter) => chapter.audio) ? 'WITH AUDIO' : 'READ THE TOUR'}</Badge>
      <h1>{tour.title}</h1><p className="tour-intro">{tour.intro}</p>
      <p className="metadata">{tour.chapters.length} {tour.chapters.length === 1 ? 'chapter' : 'chapters'} · {tour.language}{tour.author ? ` · By ${tour.author}` : ''}</p>
    </section>
    <TourMap key={tour.id} tour={tour} />
    <div className="chapter-heading"><h2>One stop at a time.</h2><Eyebrow>THE CHAPTERS</Eyebrow></div>
    <ol className="chapter-list">
      {tour.chapters.map((chapter, index) => <li key={chapter.id}>
        <Link to={`/tours/${tour.id}/chapters/${chapter.id}`} aria-label={`Chapter ${index + 1}: ${chapter.title}`} className="chapter-row">
          <span className="chapter-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="chapter-row-copy"><span className="chapter-row-title">{chapter.title}</span><span className="location-line"><MapPin size={13} aria-hidden="true" />{chapter.location.name}</span></span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </li>)}
    </ol>
    <p className="small muted tour-note">Every chapter includes a transcript and a map. Listen when narration is available, read at your own pace, and open any stop in Maps.</p>
  </>;
}
