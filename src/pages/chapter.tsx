import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';

import { BackLink, Eyebrow, MissingContent } from '@/components/ui';
import { AudioUnavailable } from '@/features/audio/audio-unavailable';
import { ChapterLocationPanel } from '@/features/maps/chapter-location';
import { ChapterPhotos } from '@/features/photos/chapter-photos';
import { hasTourAudio, loadTourAudio, loadTourImage, loadTourTranscript, tours } from '@/features/tours/catalog';

const ChapterPlayer = lazy(() => import('@/features/audio/chapter-player').then((module) => ({ default: module.ChapterPlayer })));

export function ChapterPage() {
  const { tourId, chapterId } = useParams();
  const tour = tours.find((entry) => entry.id === tourId);
  const index = tour?.chapters.findIndex((entry) => entry.id === chapterId) ?? -1;
  const chapter = tour?.chapters[index];
  if (!tour || !chapter) return <MissingContent title="Chapter not found" />;
  const transcript = loadTourTranscript(tour.id, chapter.transcript);
  const images = (chapter.images ?? []).map((path) => loadTourImage(tour.id, path)).filter((url): url is string => url !== null);
  const previous = tour.chapters[index - 1];
  const next = tour.chapters[index + 1];
  const key = `${tour.id}/${chapter.id}`;
  return <>
    <BackLink to={`/tours/${tour.id}`}>Tour overview</BackLink>
    <section className="chapter-introduction">
      <Eyebrow>CHAPTER {String(index + 1).padStart(2, '0')} OF {String(tour.chapters.length).padStart(2, '0')}</Eyebrow>
      <h1>{chapter.title}</h1><p className="location-line"><MapPin size={16} aria-hidden="true" />{chapter.location.name}</p>
    </section>
    <nav className="chapter-navigation" aria-label="Chapter navigation">
      {previous ? <Link className="button" replace to={`/tours/${tour.id}/chapters/${previous.id}`}><ArrowLeft size={17} aria-hidden="true" />Previous chapter</Link>
        : <Link className="finish-link" to={`/tours/${tour.id}`}>← Back to tour overview</Link>}
      {next ? <Link className="button primary" replace to={`/tours/${tour.id}/chapters/${next.id}`}>Next chapter<ArrowRight size={17} aria-hidden="true" /></Link> : <Link className="finish-link" to={`/tours/${tour.id}`}>Back to tour overview →</Link>}
    </nav>
    {chapter.audio && (hasTourAudio(tour.id, chapter.audio)
      ? <Suspense fallback={null}><ChapterPlayer key={key} loadSource={() => loadTourAudio(tour.id, chapter.audio)} title={chapter.title} tourTitle={tour.title} skipForwardSeconds={10} skipBackwardSeconds={10} /></Suspense>
      : <AudioUnavailable />)}
    <ChapterLocationPanel key={`location/${key}`} location={chapter.location} />
    <ChapterPhotos key={`photos/${key}`} images={images} locationName={chapter.location.name} />
    <section className="transcript"><h2>The transcript</h2>{transcript
      ? transcript.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)
      : <p role="status">Transcript not available.</p>}</section>
  </>;
}
