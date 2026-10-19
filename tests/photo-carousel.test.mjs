import assert from 'node:assert/strict';
import test from 'node:test';

import { photoCarouselReducer } from '../src/features/photos/photo-carousel-state.ts';

test('a failed photo is skipped in manifest order and is no longer navigable', () => {
  const state = photoCarouselReducer({ images: ['/first.jpg', '/broken.jpg', '/last.jpg'], selected: 1 }, { type: 'failed', src: '/broken.jpg' });
  assert.deepEqual(state, { images: ['/first.jpg', '/last.jpg'], selected: 1 });
  const next = photoCarouselReducer(state, { type: 'move', direction: 1 });
  assert.deepEqual(next, { images: ['/first.jpg', '/last.jpg'], selected: 0 });
  assert.equal(photoCarouselReducer(next, { type: 'move', direction: -1 }).selected, 1);
});

test('failure of the last photo wraps forward while a stale failure preserves the current photo', () => {
  assert.deepEqual(photoCarouselReducer({ images: ['/first.jpg', '/broken.jpg'], selected: 1 }, { type: 'failed', src: '/broken.jpg' }),
    { images: ['/first.jpg'], selected: 0 });
  assert.deepEqual(photoCarouselReducer({ images: ['/stale.jpg', '/current.jpg', '/last.jpg'], selected: 1 }, { type: 'failed', src: '/stale.jpg' }),
    { images: ['/current.jpg', '/last.jpg'], selected: 0 });
});

test('exhausting failed photos leaves an empty carousel that can safely ignore navigation', () => {
  const state = photoCarouselReducer({ images: ['/broken.jpg'], selected: 0 }, { type: 'failed', src: '/broken.jpg' });
  assert.deepEqual(state, { images: [], selected: 0 });
  assert.deepEqual(photoCarouselReducer(state, { type: 'move', direction: 1 }), { images: [], selected: 0 });
});

test('repeated references to a failed photo are all removed without skipping the next distinct photo', () => {
  const state = photoCarouselReducer({ images: ['/broken.jpg', '/first.jpg', '/broken.jpg', '/next.jpg', '/last.jpg'], selected: 2 },
    { type: 'failed', src: '/broken.jpg' });
  assert.deepEqual(state, { images: ['/first.jpg', '/next.jpg', '/last.jpg'], selected: 1 });
});
