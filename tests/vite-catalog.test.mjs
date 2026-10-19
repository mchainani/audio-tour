import assert from 'node:assert/strict';
import test from 'node:test';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createServer } from 'vite';

test('Vite discovers manifests and resolves each chapter to an external media URL', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tours/catalog-test-'));
  const manifest = JSON.parse(await readFile('tours/san-francisco-waterfront/tour.json', 'utf8'));
  manifest.id = directory.split('/').at(-1).toLowerCase();
  manifest.chapters.forEach((chapter, index) => {
    chapter.audio = `audio/chapter-${index}.${['m4A', 'Mp3', 'wAv'][index]}`;
    delete chapter.images;
  });
  await mkdir(join(directory, 'audio'));
  await cp('tours/san-francisco-waterfront/transcripts', join(directory, 'transcripts'), { recursive: true });
  manifest.chapters[0].images = ['images/front.png', 'images/detail.PNG'];
  await mkdir(join(directory, 'images'));
  for (const image of manifest.chapters[0].images) {
    await writeFile(join(directory, image), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF9sAAAAASUVORK5CYII=', 'base64'));
  }
  await writeFile(join(directory, 'tour.json'), JSON.stringify(manifest));
  await Promise.all(manifest.chapters.map((chapter) => writeFile(join(directory, chapter.audio), '')));
  const server = await createServer({ configFile: false, cacheDir: 'node_modules/.vite-test', logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  try {
    const { tours, loadTourAudio, loadTourTranscript, loadTourImage } = await server.ssrLoadModule('/src/features/tours/catalog.ts');
    assert.ok(tours.some((tour) => tour.id === 'new-york-city'));
    assert.ok(tours.some((tour) => tour.id === 'san-francisco-waterfront'));
    assert.ok(tours.some((tour) => tour.id === manifest.id), 'mixed-case audio extensions remain discoverable');
    for (const tour of tours) {
      for (const chapter of tour.chapters) {
        const sourceDirectory = tour.id === manifest.id ? directory : join(process.cwd(), 'tours', tour.id);
        assert.equal(loadTourTranscript(tour.id, chapter.transcript), await readFile(join(sourceDirectory, chapter.transcript), 'utf8'));
        for (const image of chapter.images ?? []) {
          assert.ok((await readFile(join(sourceDirectory, image))).length > 0, `${chapter.id} needs a nonempty image`);
          assert.ok(loadTourImage(tour.id, image).endsWith(image));
        }
        const url = loadTourAudio(tour.id, chapter.audio);
        if (chapter.audio === undefined) {
          assert.equal(url, null);
          continue;
        }
        assert.ok(url.startsWith('/tours/'), `${chapter.id} needs an external asset URL`);
        assert.ok(url.endsWith(chapter.audio));
      }
    }
    assert.equal(loadTourAudio('missing-tour', 'audio/the-battery.m4a'), null);
    for (const image of manifest.chapters[0].images) {
      assert.equal(loadTourImage(manifest.id, image), `/tours/${directory.split('/').at(-1)}/${image}`);
    }
  } finally {
    await server.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('text-only chapters show their transcript and location without mounting audio controls', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tours/text-only-test-'));
  const manifest = JSON.parse(await readFile('tours/san-francisco-waterfront/tour.json', 'utf8'));
  manifest.id = directory.split('/').at(-1).toLowerCase();
  manifest.chapters = [manifest.chapters[0]];
  manifest.chapters[0].transcript = 'transcripts/ferry-building.txt';
  delete manifest.chapters[0].audio;
  delete manifest.chapters[0].images;
  await mkdir(join(directory, 'transcripts'));
  await writeFile(join(directory, manifest.chapters[0].transcript), 'A chapter to read before its narration is ready.\n\nTake a moment to look around.');
  await writeFile(join(directory, 'tour.json'), JSON.stringify(manifest));
  const server = await createServer({ configFile: false, resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } }, cacheDir: 'node_modules/.vite-test', logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  try {
    const { ChapterPage } = await server.ssrLoadModule('/src/pages/chapter.tsx');
    // No AudioSessionProvider: rendering a player here would fail as well as expose controls.
    const markup = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [`/tours/${manifest.id}/chapters/ferry-building`] },
      createElement(Routes, null, createElement(Route, { path: '/tours/:tourId/chapters/:chapterId', element: createElement(ChapterPage) }))));
    assert.match(markup, /A chapter to read before its narration is ready\./);
    assert.match(markup, /<p>Take a moment to look around\.<\/p>/);
    assert.doesNotMatch(markup, /transcripts\/ferry-building.txt/);
    assert.match(markup, /aria-label="Chapter location"/);
    assert.doesNotMatch(markup, /Chapter narration|Play narration|Playback speed|Retry audio|aria-roledescription="carousel"/);
    const playerModules = server.moduleGraph.getModulesByFile(fileURLToPath(new URL('../src/features/audio/chapter-player.tsx', import.meta.url)));
    assert.ok([...playerModules ?? []].every((module) => !module.ssrModule), 'Text-only pages must not load the player module');
  } finally {
    await server.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('chapter photos have a separate section after the map and omit controls for a single photo', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tours/photo-test-'));
  const manifest = JSON.parse(await readFile('tours/san-francisco-waterfront/tour.json', 'utf8'));
  manifest.id = directory.split('/').at(-1).toLowerCase();
  manifest.chapters = [manifest.chapters[0]];
  delete manifest.chapters[0].audio;
  await cp('tours/san-francisco-waterfront/transcripts', join(directory, 'transcripts'), { recursive: true });
  await mkdir(join(directory, 'images'));
  await cp('docs/screenshots/tour-overview-map.jpg', join(directory, 'images/front.jpg'));
  await cp('docs/screenshots/library-tour-map.jpg', join(directory, 'images/detail.jpg'));
  const server = await createServer({ configFile: false, resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } }, cacheDir: 'node_modules/.vite-test', logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  try {
    for (const images of [[], ['images/front.jpg'], ['images/front.jpg', 'images/detail.jpg']]) {
      manifest.chapters[0].images = images;
      await writeFile(join(directory, 'tour.json'), JSON.stringify(manifest));
      server.moduleGraph.invalidateAll();
      const { ChapterPage } = await server.ssrLoadModule('/src/pages/chapter.tsx');
      const markup = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [`/tours/${manifest.id}/chapters/ferry-building`] },
        createElement(Routes, null, createElement(Route, { path: '/tours/:tourId/chapters/:chapterId', element: createElement(ChapterPage) }))));
      if (images.length === 0) {
        assert.doesNotMatch(markup, /aria-roledescription="carousel"|aria-label="Chapter photos"/);
        continue;
      }
      const stopMarkup = markup.match(/<aside[^>]*aria-label="Chapter location"[^>]*>[\s\S]*?<\/aside>/)?.[0];
      assert.ok(stopMarkup);
      assert.doesNotMatch(stopMarkup, /aria-roledescription="carousel"|<img\b/);
      assert.match(markup, /<\/aside>[\s\S]*<section[^>]*aria-label="Chapter photos"[^>]*>[\s\S]*PHOTOS[\s\S]*aria-roledescription="carousel"[\s\S]*<img[^>]*src="[^"]*\/images\/front.jpg"[\s\S]*class="transcript"/);
      assert.equal((markup.match(/<img\b/g) ?? []).length, 1);
      if (images.length === 1) {
        assert.doesNotMatch(markup, /Previous photo|Next photo/);
      } else {
        assert.match(markup, /aria-label="Previous photo"/);
        assert.match(markup, /aria-label="Next photo"/);
      }
    }
  } finally {
    await server.close();
    await rm(directory, { recursive: true, force: true });
  }
});
