import type { APIRoute } from 'astro';
import { getBackend } from '../../lib/server/backend';
import { handleStateRequest } from '../../lib/server/state-api';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) =>
  handleStateRequest(request, await getBackend());
