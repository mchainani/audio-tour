import { Route, Routes } from 'react-router-dom';

import { Screen } from '@/components/screen';
import { MissingContent } from '@/components/ui';
import { LibraryPage } from '@/pages/library';
import { TourPage } from '@/pages/tour';
import { ChapterPage } from '@/pages/chapter';

export function App() {
  return <Routes><Route element={<Screen />}>
    <Route index element={<LibraryPage />} />
    <Route path="tours/:tourId" element={<TourPage />} />
    <Route path="tours/:tourId/chapters/:chapterId" element={<ChapterPage />} />
    <Route path="*" element={<MissingContent title="A little off the path." />} />
  </Route></Routes>;
}
