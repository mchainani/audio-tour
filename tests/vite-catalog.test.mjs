import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'vite';

test('Vite discovers manifests and resolves each chapter to an external media URL', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tours/catalog-test-'));
  const manifest = JSON.parse(await readFile('tours/san-francisco-waterfront/tour.json', 'utf8'));
  manifest.id = directory.split('/').at(-1).toLowerCase();
  manifest.chapters.forEach((chapter, index) => { chapter.audio = `audio/chapter-${index}.${['m4A', 'Mp3', 'wAv'][index]}`; });
  await mkdir(join(directory, 'audio'));
  await writeFile(join(directory, 'tour.json'), JSON.stringify(manifest));
  await Promise.all(manifest.chapters.map((chapter) => writeFile(join(directory, chapter.audio), '')));
  const server = await createServer({ configFile: false, cacheDir: 'node_modules/.vite-test', logLevel: 'silent', server: { middlewareMode: true, hmr: false, ws: false, watch: null }, appType: 'custom' });
  try {
    const { tours, loadTourAudio } = await server.ssrLoadModule('/src/features/tours/catalog.ts');
    assert.ok(tours.some((tour) => tour.id === 'new-york-city'));
    assert.ok(tours.some((tour) => tour.id === 'san-francisco-waterfront'));
    assert.ok(tours.some((tour) => tour.id === manifest.id), 'mixed-case audio extensions remain discoverable');
    for (const tour of tours) {
      for (const chapter of tour.chapters) {
        const url = loadTourAudio(tour.id, chapter.audio);
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
