/** Add byte-range delivery when the static asset origin returns the full recording. */
export async function audioRangeResponse(request, response) {
  if (response.status !== 200) return response;
  const headers = new Headers(response.headers);
  headers.set('Accept-Ranges', 'bytes');
  const fullResponse = () => new Response(response.body, { status: response.status, headers });
  const range = request.headers.get('Range');
  const ifRange = request.headers.get('If-Range');
  if (request.method !== 'GET' || !range || (ifRange && ifRange !== headers.get('ETag') && ifRange !== headers.get('Last-Modified'))) return fullResponse();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return fullResponse();

  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start || (!match[1] && Number(match[2]) === 0)) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.set('Content-Length', '0');
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(buffer.slice(start, end + 1), { status: 206, headers });
}
