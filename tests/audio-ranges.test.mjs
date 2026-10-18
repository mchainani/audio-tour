import assert from 'node:assert/strict';
import test from 'node:test';

import { audioRangeResponse } from '../server/audio-ranges.mjs';

const recording = () => new Response('0123456789', {
  headers: { 'Content-Type': 'audio/mp4', 'Content-Length': '10', ETag: '"recording"' },
});
const request = (range, extra = {}) => new Request('https://audio-tour.pages.dev/assets/test.m4a', {
  headers: { ...(range ? { Range: range } : {}), ...extra },
});

test('serves exactly the requested audio bytes with range metadata', async () => {
  const response = await audioRangeResponse(request('bytes=2-5'), recording());
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('Content-Range'), 'bytes 2-5/10');
  assert.equal(response.headers.get('Content-Length'), '4');
  assert.equal(response.headers.get('Content-Type'), 'audio/mp4');
  assert.equal(response.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(await response.text(), '2345');
});

test('supports open-ended, suffix, and oversized audio ranges', async () => {
  for (const [range, content] of [['bytes=7-', '789'], ['bytes=-3', '789'], ['bytes=8-99', '89'], ['bytes=-99', '0123456789']]) {
    const response = await audioRangeResponse(request(range), recording());
    assert.equal(response.status, 206);
    assert.equal(await response.text(), content);
  }
});

test('rejects unsatisfiable audio ranges', async () => {
  for (const range of ['bytes=10-', 'bytes=6-2', 'bytes=-0']) {
    const response = await audioRangeResponse(request(range), recording());
    assert.equal(response.status, 416);
    assert.equal(response.headers.get('Content-Range'), 'bytes */10');
    assert.equal(await response.text(), '');
  }
});

test('leaves normal, malformed, multi-range, and stale If-Range requests as full responses', async () => {
  for (const req of [request(), request('bytes=oops'), request('bytes=0-1,4-5'), request('bytes=0-1', { 'If-Range': '"old-recording"' })]) {
    const response = await audioRangeResponse(req, recording());
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '0123456789');
  }
  assert.equal((await audioRangeResponse(request('bytes=0-1', { 'If-Range': '"recording"' }), recording())).status, 206);
});

test('preserves origin errors and existing partial responses', async () => {
  for (const status of [206, 404]) {
    const response = await audioRangeResponse(request('bytes=0-1'), new Response('origin', { status }));
    assert.equal(response.status, status);
    assert.equal(await response.text(), 'origin');
  }
});
