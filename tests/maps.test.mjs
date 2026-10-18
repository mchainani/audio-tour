import assert from 'node:assert/strict';
import test from 'node:test';

import { mapLinks } from '../src/features/maps/map-links.ts';

const location = { name: 'Pier 7 & café', latitude: 37.8031, longitude: -122.3982 };

test('desktop Google Maps targets the exact chapter coordinates', () => {
  const url = new URL(mapLinks(location).googleWeb);
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('query'), '37.8031,-122.3982');
});

test('Apple Maps preserves the location label and coordinates without extra query parameters', () => {
  const url = new URL(mapLinks(location).apple);
  assert.equal(url.hostname, 'maps.apple.com');
  assert.equal(url.searchParams.get('ll'), '37.8031,-122.3982');
  assert.equal(url.searchParams.get('q'), location.name);
  assert.equal([...url.searchParams].length, 2);
});

test('Apple and Google Maps preserve zero coordinates', () => {
  const links = mapLinks({ ...location, latitude: 0, longitude: 0 });
  assert.equal(new URL(links.apple).searchParams.get('ll'), '0,0');
  assert.equal(new URL(links.googleWeb).searchParams.get('query'), '0,0');
});
