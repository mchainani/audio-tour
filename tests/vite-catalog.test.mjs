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
  manifest.chapters.forEach((chapter, index) => { chapter.audio = `audio/chapter-${index}.${['m4A', 'Mp3', 'wAv'][index]}`; });
  await mkdir(join(directory, 'audio'));
  await cp('tours/san-francisco-waterfront/transcripts', join(directory, 'transcripts'), { recursive: true });
  await writeFile(join(directory, 'tour.json'), JSON.stringify(manifest));
  await Promise.all(manifest.chapters.map((chapter) => writeFile(join(directory, chapter.audio), '')));
  const server = await createServer({ configFile: false, cacheDir: 'node_modules/.vite-test', logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  try {
    const { tours, loadTourAudio, loadTourTranscript } = await server.ssrLoadModule('/src/features/tours/catalog.ts');
    assert.ok(tours.some((tour) => tour.id === 'new-york-city'));
    assert.ok(tours.some((tour) => tour.id === 'san-francisco-waterfront'));
    assert.ok(tours.some((tour) => tour.id === manifest.id), 'mixed-case audio extensions remain discoverable');
    for (const tour of tours) {
      for (const chapter of tour.chapters) {
        const sourceDirectory = tour.id === manifest.id ? directory : join(process.cwd(), 'tours', tour.id);
        assert.equal(loadTourTranscript(tour.id, chapter.transcript), await readFile(join(sourceDirectory, chapter.transcript), 'utf8'));
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
    assert.doesNotMatch(markup, /Chapter narration|Play narration|Playback speed|Retry audio/);
    const playerModules = server.moduleGraph.getModulesByFile(fileURLToPath(new URL('../src/features/audio/chapter-player.tsx', import.meta.url)));
    assert.ok([...playerModules ?? []].every((module) => !module.ssrModule), 'Text-only pages must not load the player module');
  } finally {
    await server.close();
    await rm(directory, { recursive: true, force: true });
  }
});
