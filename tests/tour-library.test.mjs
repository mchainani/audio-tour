import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { createTourLibrary } from '../src/features/tours/tour-library.ts';

const root = new URL('../tours/', import.meta.url);
const entries = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(new URL(`${entry.name}/tour.json`, root)))
  .map((entry) => ({ directory: entry.name, manifest: JSON.parse(readFileSync(new URL(`${entry.name}/tour.json`, root), 'utf8')) }));
const audioKeys = entries.flatMap(({ directory, manifest }) => manifest.chapters.map((chapter) => `./${directory}/${chapter.audio}`));

test('discovers every tour manifest without a manually maintained tour list', () => {
  const library = createTourLibrary(entries, audioKeys, () => 123);
  assert.equal(library.tours.length, entries.length);
  assert.equal(library.tours.find((tour) => tour.id === 'new-york-city')?.chapters.length, 5);
  assert.equal(library.tours.find((tour) => tour.id === 'san-francisco-waterfront')?.chapters.length, 3);

  const extra = structuredClone(entries[0]);
  extra.directory = 'third-tour';
  extra.manifest.id = 'third-tour';
  const extraKeys = extra.manifest.chapters.map((chapter) => `./third-tour/${chapter.audio}`);
  assert.equal(createTourLibrary([...entries, extra], [...audioKeys, ...extraKeys], () => 123).tours.length, entries.length + 1);
});

test('reads metadata without resolving any audio and resolves only requested chapter audio', () => {
  const resolved = [];
  const library = createTourLibrary(entries, audioKeys, (key) => {
    resolved.push(key);
    return { uri: join('assets', key) };
  });
  assert.deepEqual(resolved, []);
  assert.deepEqual(library.loadAudio('new-york-city', 'audio/the-battery.m4a'), { uri: 'assets/new-york-city/audio/the-battery.m4a' });
  assert.deepEqual(resolved, ['./new-york-city/audio/the-battery.m4a']);
  assert.equal(library.loadAudio('new-york-city', '../san-francisco-waterfront/audio/ferry-building.m4a'), null);
  assert.equal(library.loadAudio('unknown-tour', 'audio/the-battery.m4a'), null);
  assert.deepEqual(resolved, ['./new-york-city/audio/the-battery.m4a']);
});

test('uses the manifest directory even when it differs from the tour ID', () => {
  const entry = structuredClone(entries[0]);
  entry.directory = 'different-folder';
  const keys = entry.manifest.chapters.map((chapter) => `./different-folder/${chapter.audio}`);
  const library = createTourLibrary([entry], keys, (key) => key);
  assert.equal(library.loadAudio(entry.manifest.id, entry.manifest.chapters[0].audio), keys[0]);
});

test('rejects duplicate tour and chapter IDs', () => {
  assert.throws(() => createTourLibrary([entries[0], entries[0]], audioKeys, () => 123), /duplicate tour/i);
  const entry = structuredClone(entries[0]);
  entry.manifest.chapters.push(entry.manifest.chapters[0]);
  assert.throws(() => createTourLibrary([entry], audioKeys, () => 123), /duplicate chapter/i);
});

test('rejects unsupported schemas, unsafe paths, and invalid coordinates with a manifest path', () => {
  for (const mutate of [
    (tour) => { tour.schemaVersion = 2; },
    (tour) => { tour.chapters[0].audio = 'audio/../../secret.m4a'; },
    (tour) => { tour.chapters[0].location.latitude = 91; },
    (tour) => { tour.title = ''; },
  ]) {
    const entry = structuredClone(entries[0]);
    mutate(entry.manifest);
    assert.throws(() => createTourLibrary([entry], audioKeys, () => 123), new RegExp(`tours/${entry.directory}/tour.json`));
  }
});

test('rejects missing referenced audio and accepts an empty tour directory', () => {
  assert.throws(() => createTourLibrary(entries, [], () => 123), /missing audio/i);
  assert.deepEqual(createTourLibrary([], [], () => 123).tours, []);
});
