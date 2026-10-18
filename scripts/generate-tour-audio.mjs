import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'darwin') {
  throw new Error('Narration generation requires macOS say and afconvert. The generated files run on every app platform.');
}

const sampleDirectory = fileURLToPath(new URL('../samples/san-francisco-waterfront/', import.meta.url));
const tour = JSON.parse(readFileSync(join(sampleDirectory, 'tour.json'), 'utf8'));
const voice = process.env.NARRATION_VOICE || 'Samantha';
const rate = Number(process.env.NARRATION_RATE || 155);

if (!Number.isFinite(rate) || rate <= 0) {
  throw new Error('NARRATION_RATE must be a positive number of words per minute.');
}

if (!/^[a-z0-9-]+$/.test(tour.id) || !Array.isArray(tour.chapters) || tour.chapters.some((chapter) => !/^[a-z0-9-]+$/.test(chapter.id))) {
  throw new Error('Tour and chapter IDs must contain only lowercase letters, numbers, and hyphens.');
}

const temporaryDirectory = mkdtempSync(join(tmpdir(), 'audio-tour-narration-'));
const packageDirectory = join(temporaryDirectory, 'package');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error || result.status !== 0) {
    throw new Error(`${basename(command)} failed: ${result.error?.message || result.stderr || result.stdout}`);
  }
}

try {
  mkdirSync(join(packageDirectory, 'audio'), { recursive: true });
  writeFileSync(join(packageDirectory, 'tour.json'), JSON.stringify(tour, null, 2) + '\n');

  for (const chapter of tour.chapters) {
    if (!/^audio\/[a-z0-9-]+\.m4a$/.test(chapter.audio)) {
      throw new Error(`Unsupported bundled audio path: ${chapter.audio}`);
    }
    const transcriptPath = join(temporaryDirectory, `${chapter.id}.txt`);
    const speechPath = join(temporaryDirectory, `${chapter.id}.aiff`);
    writeFileSync(transcriptPath, chapter.transcript + '\n');
    run('/usr/bin/say', ['-v', voice, '-r', String(rate), '-f', transcriptPath, '-o', speechPath]);
    // System voices can render at 22.05 kHz; use a fixed rate supported by this AAC bitrate.
    run('/usr/bin/afconvert', ['-f', 'm4af', '-d', 'aac @44100', '-b', '96000', speechPath, join(packageDirectory, chapter.audio)]);
    console.log(`Generated ${chapter.audio} (${voice}, ${rate} words/minute)`);
  }

  const archivePath = join(temporaryDirectory, `${tour.id}.zip`);
  run('/usr/bin/zip', ['-q', '-r', archivePath, 'tour.json', 'audio'], { cwd: packageDirectory });
  mkdirSync(join(sampleDirectory, 'audio'), { recursive: true });
  for (const chapter of tour.chapters) {
    copyFileSync(join(packageDirectory, chapter.audio), join(sampleDirectory, chapter.audio));
  }
  copyFileSync(archivePath, fileURLToPath(new URL(`../samples/${tour.id}.zip`, import.meta.url)));
  console.log(`Created samples/${tour.id}.zip`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
