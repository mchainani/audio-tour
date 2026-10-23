import assert from 'node:assert/strict';
import test from 'node:test';

import { loadWalkingRoute } from '../src/features/maps/walking-route.ts';

const locations = [
  { name: 'First', latitude: 37.7955, longitude: -122.3937 },
  { name: 'Second', latitude: 37.8031, longitude: -122.3982 },
  { name: 'Third', latitude: 37.8087, longitude: -122.409 },
];
const response = {
  code: 'Ok',
  routes: [{ geometry: { type: 'LineString', coordinates: [[-122.3937, 37.7955], [-122.395, 37.799], [-122.3982, 37.8031], [-122.409, 37.8087]] } }],
};

test('requests pedestrian routing through every stop in chapter order and converts the full path for Leaflet', async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(input);
    assert.equal(url.origin, 'https://routing.openstreetmap.de');
    assert.equal(url.pathname, '/routed-foot/route/v1/foot/-122.3937,37.7955;-122.3982,37.8031;-122.409,37.8087');
    assert.equal(url.searchParams.get('geometries'), 'geojson');
    assert.equal(url.searchParams.get('overview'), 'full');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(response);
  });
  assert.deepEqual(await loadWalkingRoute(locations, controller.signal), [
    [37.7955, -122.3937], [37.799, -122.395], [37.8031, -122.3982], [37.8087, -122.409],
  ]);
});

test('single-stop and empty tours need no routing request', async (t) => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('No route is needed'));
  assert.deepEqual(await loadWalkingRoute([], new AbortController().signal), []);
  assert.deepEqual(await loadWalkingRoute([locations[0]], new AbortController().signal), []);
});

test('unavailable or malformed walking routes are rejected instead of drawing a direct connection', async (t) => {
  const bodies = [
    { code: 'NoRoute', routes: [] },
    { code: 'Ok', routes: [] },
    { code: 'Ok', routes: [{ geometry: { type: 'LineString', coordinates: [] } }] },
    { code: 'Ok', routes: [{ geometry: { type: 'LineString', coordinates: [[0, 0], [181, 37]] } }] },
    { code: 'Ok', routes: [{ geometry: { type: 'LineString', coordinates: [[0, 0], [1, 'bad']] } }] },
    null,
  ];
  for (const body of bodies) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(body));
    await assert.rejects(loadWalkingRoute(locations, new AbortController().signal), /Walking route unavailable/);
  }
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));
  await assert.rejects(loadWalkingRoute(locations, new AbortController().signal), /Walking route unavailable/);
});

test('leaving the map cancels an in-flight walking route', async (t) => {
  const controller = new AbortController();
  let started;
  const requestStarted = new Promise((resolve) => { started = resolve; });
  t.mock.method(globalThis, 'fetch', async (_input, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    started();
  }));
  const pending = loadWalkingRoute(locations, controller.signal);
  await requestStarted;
  controller.abort();
  await assert.rejects(pending, { name: 'AbortError' });
});

test('rapid map changes respect the routing service request limit and cancel queued requests', async (t) => {
  const times = [];
  t.mock.method(globalThis, 'fetch', async () => {
    times.push(Date.now());
    return Response.json(response);
  });
  const first = loadWalkingRoute(locations, new AbortController().signal);
  const second = loadWalkingRoute(locations, new AbortController().signal);
  const controller = new AbortController();
  const cancelled = loadWalkingRoute(locations, controller.signal);
  controller.abort();
  await assert.rejects(cancelled, { name: 'AbortError' });
  await Promise.all([first, second]);
  assert.equal(times.length, 2);
  assert.ok(times[1] - times[0] >= 950, 'Walking requests must be spaced one second apart');
});
