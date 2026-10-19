import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { createTourLibrary } from '../src/features/tours/tour-library.ts';

const root = new URL('../tours/', import.meta.url);
const entries = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(new URL(`${entry.name}/tour.json`, root)))
  .map((entry) => ({ directory: entry.name, manifest: JSON.parse(readFileSync(new URL(`${entry.name}/tour.json`, root), 'utf8')) }));
const audioEntry = entries.find((entry) => entry.manifest.id === 'san-francisco-waterfront');
const audioKeys = entries.flatMap(({ directory, manifest }) => manifest.chapters.flatMap((chapter) => chapter.audio === undefined ? [] : [`./${directory}/${chapter.audio}`]));

const transcriptEntry = {
  directory: 'guide-folder',
  manifest: {
    schemaVersion: 1, id: 'guide-tour', title: 'Guide tour', intro: 'Explore the city.', language: 'en-US',
    location: { name: 'City', latitude: 0, longitude: 0 },
    chapters: [{ id: 'first-stop', title: 'First stop', location: { name: 'Square', latitude: 0, longitude: 0 }, transcript: 'transcripts/first-stop.txt' }],
  },
};
const transcriptFiles = new Map([
  ['./guide-folder/transcripts/first-stop.txt', 'Welcome to the square.\n\nLook at the café.'],
  ['./guide-folder/transcripts/unlisted.txt', 'An unpublished draft.'],
]);

test('retains transcript references and resolves exact text within the manifest directory', () => {
  const library = createTourLibrary([transcriptEntry], [], () => assert.fail('Reading must not load audio'), transcriptFiles);
  assert.equal(library.tours[0].chapters[0].transcript, 'transcripts/first-stop.txt');
  assert.equal(library.loadTranscript('guide-tour', 'transcripts/first-stop.txt'), 'Welcome to the square.\n\nLook at the café.');
  assert.equal(library.loadTranscript('unknown-tour', 'transcripts/first-stop.txt'), null);
  assert.equal(library.loadTranscript('guide-tour', 'transcripts/unlisted.txt'), null);
  assert.equal(library.loadTranscript('guide-tour', '../other/transcripts/first-stop.txt'), null);
});

test('rejects inline text and unsafe transcript paths with the manifest path', () => {
  for (const transcript of [undefined, null, '', 'Welcome to the square.', '/transcripts/first-stop.txt', 'transcripts/../first-stop.txt', 'transcripts/a/../../first-stop.txt', 'transcripts\\first-stop.txt', 'transcripts/first-stop.md', 'https://example.com/transcript.txt']) {
    const entry = structuredClone(transcriptEntry);
    entry.manifest.chapters[0].transcript = transcript;
    assert.throws(() => createTourLibrary([entry], [], () => null, transcriptFiles), /tours\/guide-folder\/tour.json: Chapter first-stop needs a safe relative .*transcripts\//);
  }
});

test('rejects missing and blank transcript files with their manifest and reference', () => {
  assert.throws(() => createTourLibrary([transcriptEntry], [], () => null, new Map()), /tours\/guide-folder\/tour.json: Missing transcript file: transcripts\/first-stop.txt/);
  assert.throws(() => createTourLibrary([transcriptEntry], [], () => null, new Map([['./guide-folder/transcripts/first-stop.txt', ' \n\t']])), /tours\/guide-folder\/tour.json: Empty transcript file: transcripts\/first-stop.txt/);
});

const imageFiles = new Map([
  ['./guide-folder/images/first-stop/front.jpg', '/assets/front.jpg'],
  ['./guide-folder/images/first-stop/detail.PNG', '/assets/detail.PNG'],
  ['./guide-folder/images/unlisted.webp', '/assets/unlisted.webp'],
]);

test('preserves optional image references and resolves declared photos within their tour directory', () => {
  const entry = structuredClone(transcriptEntry);
  entry.manifest.chapters[0].images = ['images/first-stop/front.jpg', 'images/first-stop/detail.PNG'];
  const library = createTourLibrary([entry], [], () => assert.fail('Photos must not resolve audio'), transcriptFiles, imageFiles);
  assert.deepEqual(library.tours[0].chapters[0].images, ['images/first-stop/front.jpg', 'images/first-stop/detail.PNG']);
  assert.equal(library.loadImage('guide-tour', 'images/first-stop/front.jpg'), '/assets/front.jpg');
  assert.equal(library.loadImage('guide-tour', 'images/first-stop/detail.PNG'), '/assets/detail.PNG');
  assert.equal(library.loadImage('unknown-tour', 'images/first-stop/front.jpg'), null);
  assert.equal(library.loadImage('guide-tour', 'images/unlisted.webp'), null);
  assert.equal(library.loadImage('guide-tour', '../other/images/front.jpg'), null);
});

test('accepts absent and empty chapter image lists without exposing undeclared photos', () => {
  for (const images of [undefined, []]) {
    const entry = structuredClone(transcriptEntry);
    if (images !== undefined) entry.manifest.chapters[0].images = images;
    const library = createTourLibrary([entry], [], () => null, transcriptFiles, imageFiles);
    assert.equal(library.loadImage('guide-tour', 'images/first-stop/front.jpg'), null);
  }
});

test('rejects malformed image lists and unsafe or unsupported photo references', () => {
  for (const images of [null, 'images/front.jpg', {}, [null], [3], [''], ['https://example.com/front.jpg'], ['/images/front.jpg'], ['images/../front.jpg'], ['images/a/../../front.jpg'], ['images\\front.jpg'], ['images/front.svg'], ['images/front.heic']]) {
    const entry = structuredClone(transcriptEntry);
    entry.manifest.chapters[0].images = images;
    assert.throws(() => createTourLibrary([entry], [], () => null, transcriptFiles, imageFiles), /tours\/guide-folder\/tour.json: Chapter first-stop needs .*images/);
  }
});

test('rejects missing referenced photos with the manifest path', () => {
  const entry = structuredClone(transcriptEntry);
  entry.manifest.chapters[0].images = ['images/missing.jpg'];
  assert.throws(() => createTourLibrary([entry], [], () => null, transcriptFiles, imageFiles), /tours\/guide-folder\/tour.json: Missing image file: images\/missing.jpg/);
});

const transcripts = new Map(entries.flatMap(({ directory, manifest }) => manifest.chapters.map((chapter) =>
  [`./${directory}/${chapter.transcript}`, readFileSync(new URL(`${directory}/${chapter.transcript}`, root), 'utf8')])));
const tourImages = new Map(entries.flatMap(({ directory, manifest }) => manifest.chapters.flatMap((chapter) =>
  (chapter.images ?? []).map((path) => {
    assert.ok(existsSync(new URL(`${directory}/${path}`, root)), `Missing photo: ${directory}/${path}`);
    return [`./${directory}/${path}`, `/tours/${directory}/${path}`];
  }))));
function rebaseTranscripts(directory) {
  return new Map([...transcripts, ...audioEntry.manifest.chapters.map((chapter) =>
    [`./${directory}/${chapter.transcript}`, transcripts.get(`./${audioEntry.directory}/${chapter.transcript}`)])]);
}
function rebaseImages(directory) {
  return new Map([...tourImages, ...audioEntry.manifest.chapters.flatMap((chapter) =>
    (chapter.images ?? []).map((path) => [`./${directory}/${path}`, `/tours/${directory}/${path}`]))]);
}
function createLibrary(entries, audioKeys, loadAsset, files = transcripts, images = tourImages) {
  return createTourLibrary(entries, audioKeys, loadAsset, files, images);
}

test('accepts chapters without audio without resolving media', () => {
  const entry = structuredClone(audioEntry);
  for (const chapter of entry.manifest.chapters) {
    delete chapter.audio;
  }
  const library = createLibrary([entry], [], () => assert.fail('Text-only chapters must not resolve media'));
  assert.equal(library.tours[0].chapters.length, 3);
  assert.equal(library.loadAudio(entry.manifest.id, undefined), null);
  assert.equal(library.loadAudio(entry.manifest.id, 'audio/ferry-building.m4a'), null);
});

test('accepts a tour mixing text-only chapters and narration', () => {
  const entry = structuredClone(audioEntry);
  delete entry.manifest.chapters[0].audio;
  const library = createLibrary([entry], audioKeys, (key) => key);
  assert.equal(library.loadAudio(entry.manifest.id, undefined), null);
  assert.equal(library.loadAudio(entry.manifest.id, 'audio/pier-seven.m4a'), './san-francisco-waterfront/audio/pier-seven.m4a');
});

test('rejects malformed audio when the property is supplied', () => {
  for (const audio of [null, '', ' ', false, 123, 'audio/../../secret.m4a', 'audio/file.ogg']) {
    const entry = structuredClone(audioEntry);
    entry.manifest.chapters[0].audio = audio;
    assert.throws(() => createLibrary([entry], audioKeys, () => 123), /safe relative path/);
  }
});

test('discovers every tour manifest without a manually maintained tour list', () => {
  const library = createLibrary(entries, audioKeys, () => 123);
  assert.equal(library.tours.length, entries.length);
  assert.equal(library.tours.find((tour) => tour.id === 'new-york-city')?.chapters.length, 5);
  assert.equal(library.tours.find((tour) => tour.id === 'san-francisco-waterfront')?.chapters.length, 3);

  const extra = structuredClone(audioEntry);
  extra.directory = 'third-tour';
  extra.manifest.id = 'third-tour';
  const extraKeys = extra.manifest.chapters.map((chapter) => `./third-tour/${chapter.audio}`);
  assert.equal(createLibrary([...entries, extra], [...audioKeys, ...extraKeys], () => 123, rebaseTranscripts(extra.directory), rebaseImages(extra.directory)).tours.length, entries.length + 1);
});

test('reads metadata without resolving any audio and resolves only requested chapter audio', () => {
  const resolved = [];
  const library = createLibrary(entries, audioKeys, (key) => {
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
  const entry = structuredClone(audioEntry);
  entry.directory = 'different-folder';
  const keys = entry.manifest.chapters.map((chapter) => `./different-folder/${chapter.audio}`);
  const library = createLibrary([entry], keys, (key) => key, rebaseTranscripts(entry.directory), rebaseImages(entry.directory));
  assert.equal(library.loadAudio(entry.manifest.id, entry.manifest.chapters[0].audio), keys[0]);
});

test('rejects missing or invalid tour city locations with the manifest path', () => {
  const valid = { name: 'San Francisco', latitude: 37.7749, longitude: -122.4194 };
  for (const location of [
    undefined, null, {},
    { ...valid, name: ' ' },
    { ...valid, latitude: 91 },
    { ...valid, latitude: NaN },
    { ...valid, longitude: -181 },
    { ...valid, longitude: Infinity },
    { ...valid, latitude: '37.7749' },
  ]) {
    const entry = structuredClone(audioEntry);
    entry.manifest.location = location;
    assert.throws(() => createLibrary([entry], audioKeys, () => 123),
      new RegExp(`tours/${entry.directory}/tour.json: Tour needs a location name and valid coordinates`));
  }
});

test('retains tour city metadata without resolving chapter audio and accepts coordinate bounds', () => {
  for (const [latitude, longitude] of [[0, 0], [-90, -180], [90, 180]]) {
    const entry = structuredClone(audioEntry);
    entry.manifest.location = { name: 'Tour city', latitude, longitude };
    const library = createLibrary([entry], audioKeys, () => assert.fail('City metadata must not resolve narration'));
    assert.deepEqual(library.tours[0].location, entry.manifest.location);
  }
});

test('rejects duplicate tour and chapter IDs', () => {
  assert.throws(() => createLibrary([audioEntry, audioEntry], audioKeys, () => 123), /duplicate tour/i);
  const entry = structuredClone(audioEntry);
  entry.manifest.chapters.push(entry.manifest.chapters[0]);
  assert.throws(() => createLibrary([entry], audioKeys, () => 123), /duplicate chapter/i);
});

test('rejects unsupported schemas, unsafe paths, and invalid coordinates with a manifest path', () => {
  for (const mutate of [
    (tour) => { tour.schemaVersion = 2; },
    (tour) => { tour.chapters[0].audio = 'audio/../../secret.m4a'; },
    (tour) => { tour.chapters[0].location.latitude = 91; },
    (tour) => { tour.title = ''; },
  ]) {
    const entry = structuredClone(audioEntry);
    mutate(entry.manifest);
    assert.throws(() => createLibrary([entry], audioKeys, () => 123), new RegExp(`tours/${entry.directory}/tour.json`));
  }
});

test('rejects missing referenced audio and accepts an empty tour directory', () => {
  assert.throws(() => createLibrary(entries, [], () => 123), /missing audio/i);
  assert.deepEqual(createLibrary([], [], () => 123).tours, []);
});
