import assert from 'node:assert/strict';
import test from 'node:test';

import { AudioPlayback } from '../src/features/audio/audio-playback.ts';

class TestAudio extends EventTarget {
  src = '';
  preload = '';
  currentTime = 0;
  duration = 30;
  playbackRate = 1;
  preservesPitch = false;
  paused = true;
  ended = false;
  readyState = 0;
  error = null;
  playResult = Promise.resolve();
  play() { this.paused = false; this.dispatchEvent(new Event('play')); return this.playResult; }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  load() {}
  removeAttribute(name) { if (name === 'src') this.src = ''; }
  ready() { this.readyState = 4; this.dispatchEvent(new Event('loadedmetadata')); }
}

function fixture() {
  const media = [];
  const player = new AudioPlayback(() => { const audio = new TestAudio(); media.push(audio); return audio; });
  return { player, media };
}

test('changing speed before Play does not create media or resolve narration', () => {
  const { player, media } = fixture();
  assert.equal(player.getSnapshot().rate, 1);
  player.setRate(1.5);
  assert.equal(media.length, 0);
  assert.equal(player.getSnapshot().requested, false);
  let resolved = 0;
  player.start(() => { resolved++; return '/tour/first.m4a'; });
  assert.equal(resolved, 1);
  assert.equal(media.length, 1);
  assert.equal(media[0].src, '/tour/first.m4a');
  assert.equal(media[0].playbackRate, 1.5);
  assert.equal(media[0].preservesPitch, true);
});

test('paused speed changes preserve position and do not autoplay', () => {
  const { player, media } = fixture();
  player.start(() => '/first.m4a');
  media[0].ready();
  media[0].currentTime = 9;
  player.pause();
  player.setRate(2);
  assert.equal(media[0].paused, true);
  assert.equal(media[0].currentTime, 9);
  assert.equal(media[0].playbackRate, 2);
  assert.equal(player.getSnapshot().playing, false);
});

test('pausing before metadata loads leaves playback resumable', () => {
  const { player, media } = fixture();
  player.start(() => '/slow.m4a');
  assert.equal(player.getSnapshot().loading, true);
  player.pause();
  assert.equal(player.getSnapshot().playing, false);
  assert.equal(player.getSnapshot().loading, false);
  assert.equal(player.getSnapshot().error, null);
  player.play();
  assert.equal(media[0].paused, false);
  assert.equal(player.getSnapshot().loading, true);
});

test('chapter teardown releases the source and listeners but keeps session speed', () => {
  const { player, media } = fixture();
  player.start(() => '/first.m4a');
  media[0].ready();
  player.setRate(0.75);
  player.reset();
  assert.equal(media[0].paused, true);
  assert.equal(media[0].src, '');
  assert.equal(player.getSnapshot().requested, false);
  assert.equal(player.getSnapshot().duration, 0);
  media[0].dispatchEvent(new Event('error'));
  assert.equal(player.getSnapshot().error, null);
  player.start(() => '/second.m4a');
  assert.equal(media[1].playbackRate, 0.75);
});

test('seeks clamp to recording bounds and replay starts at zero', () => {
  const { player, media } = fixture();
  player.seek(10);
  assert.equal(media.length, 0);
  player.start(() => '/first.m4a');
  media[0].ready();
  player.seek(99);
  assert.equal(media[0].currentTime, 30);
  player.seek(-10);
  assert.equal(media[0].currentTime, 0);
  media[0].currentTime = 30;
  media[0].ended = true;
  media[0].paused = true;
  media[0].dispatchEvent(new Event('ended'));
  player.play();
  assert.equal(media[0].currentTime, 0);
  assert.equal(media[0].paused, false);
});

test('failed playback can retry at the chosen speed and stale failures cannot corrupt the next chapter', async () => {
  const { player, media } = fixture();
  let rejectPlay;
  player.start(() => '/first.m4a');
  media[0].playResult = new Promise((_, reject) => { rejectPlay = reject; });
  player.play();
  player.reset();
  player.start(() => '/second.m4a');
  rejectPlay(new Error('Aborted old chapter'));
  await Promise.resolve();
  assert.equal(player.getSnapshot().error, null);
  media[1].dispatchEvent(new Event('error'));
  assert.match(player.getSnapshot().error, /narration/i);
  player.setRate(1.25);
  player.start(() => '/second.m4a');
  assert.equal(player.getSnapshot().error, null);
  assert.equal(media[2].playbackRate, 1.25);
});

test('missing sources and rejected play promises produce a recoverable error', async () => {
  const { player, media } = fixture();
  player.start(() => null);
  assert.match(player.getSnapshot().error, /no narration/i);
  player.start(() => '/first.m4a');
  media[0].playResult = Promise.reject(new Error('Playback denied'));
  player.play();
  await Promise.resolve();
  assert.match(player.getSnapshot().error, /play/i);
  assert.equal(player.getSnapshot().playing, false);
});

test('pausing a pending play request does not turn an expected browser cancellation into an error', async () => {
  const { player, media } = fixture();
  player.start(() => '/first.m4a');
  let rejectPlay;
  media[0].playResult = new Promise((_, reject) => { rejectPlay = reject; });
  player.play();
  player.pause();
  rejectPlay(new DOMException('The play request was interrupted by pause', 'AbortError'));
  await Promise.resolve();
  assert.equal(player.getSnapshot().error, null);
  assert.equal(player.getSnapshot().playing, false);
});
