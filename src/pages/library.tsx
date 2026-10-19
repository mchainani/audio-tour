import { ArrowRight, Headphones, Info, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge, Eyebrow } from '@/components/ui';
import { LibraryMap } from '@/features/maps/library-map';
import { tours } from '@/features/tours/catalog';

export function LibraryPage() {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="hero-eyebrow">LOOK AROUND. LISTEN CLOSER.</p>
        <h1>Good stories.<br />Great walks.</h1>
        <p className="hero-description">A personal library of places and the stories behind them. Choose a tour and take it one chapter at a time.</p>
        <p className="hero-caption"><Headphones size={16} aria-hidden="true" />A little more to every place.</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="outer-ring" /><div className="inner-ring" />
        <div className="headphone-disc"><Headphones size={76} /></div>
        <div className="location-tag"><MapPin size={14} />Let curiosity lead.</div>
      </div>
    </section>
    <LibraryMap tours={tours} />
    <div className="section-heading">
      <div><h2>Your tours</h2><p className="muted small">Start with a little inspiration.</p></div>
      <Badge>{tours.length} {tours.length === 1 ? 'tour' : 'tours'}</Badge>
    </div>
    <div className="tour-column">
      {tours.length === 0 && <p className="muted">Your library is ready for its first tour.</p>}
      {tours.map((tour, index) => (
        <Link key={tour.id} to={`/tours/${tour.id}`} aria-label={`Explore tour ${index + 1}: ${tour.title}`} className="tour-card">
          <div className="card-top"><span className="tour-icon tour-number" aria-hidden="true">{index + 1}</span><Badge>{tour.chapters.some((chapter) => chapter.audio) ? 'WITH AUDIO' : 'READ THE TOUR'}</Badge></div>
          <Eyebrow>{tour.location.name}</Eyebrow>
          <h3>{tour.title}</h3><p className="tour-description">{tour.intro}</p>
          <div className="card-footer"><span>{tour.chapters.length} {tour.chapters.length === 1 ? 'chapter' : 'chapters'} · {tour.language}</span><span className="explore-link">Explore tour<ArrowRight size={17} aria-hidden="true" /></span></div>
        </Link>
      ))}
    </div>
    <p className="preview-note"><Info size={18} aria-hidden="true" /><span>Explore the tours with full transcripts, maps of every stop, and narration when available.</span></p>
  </>;
}
