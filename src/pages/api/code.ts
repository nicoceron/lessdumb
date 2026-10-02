import type { APIRoute } from 'astro';
import { getBackend } from '../../lib/server/backend';
import { handleCodeRequest } from '../../lib/server/compiled-code';

export const prerender = false;

export const ALL: APIRoute = async ({ request, clientAddress }) =>
  handleCodeRequest(request, await getBackend(), clientAddress);
