import { audioRangeResponse } from '../../server/audio-ranges.mjs';

export async function onRequest(context) {
  const response = await context.next();
  if (!/\.(m4a|mp3|wav)$/i.test(new URL(context.request.url).pathname)) return response;
  return audioRangeResponse(context.request, response);
}
