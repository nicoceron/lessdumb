import type { APIRoute } from 'astro';
import { getBackend } from '../../../lib/server/backend';

export const prerender = false;

export const ALL: APIRoute = async ({ request, clientAddress }) => {
  const { auth } = await getBackend();
  // Replace untrusted inbound proxy headers with Astro's resolved client address.
  const headers = new Headers(request.headers);
  headers.set('x-forwarded-for', clientAddress);
  return auth.handler(new Request(request, { headers }));
};
