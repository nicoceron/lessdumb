import type { Backend } from './backend-contract';
import { readState, writeState } from './state-store';
import {
  MAX_STATE_BODY_BYTES,
  parseStateUpdate,
  StateValidationError,
} from './state-validation';

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store', Vary: 'Cookie' },
  });
}

async function readJSON(request: Request): Promise<unknown> {
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_STATE_BODY_BYTES)
    throw new StateValidationError('Progress backup is too large.', 413);
  if (!request.body)
    throw new StateValidationError('A JSON request body is required.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_STATE_BODY_BYTES) {
      await reader.cancel();
      throw new StateValidationError('Progress backup is too large.', 413);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new StateValidationError('The request body must contain valid JSON.');
  }
}

export async function handleStateRequest(
  request: Request,
  backend: Backend,
): Promise<Response> {
  await backend.ready();
  if (request.method !== 'GET' && request.method !== 'PUT') {
    return json({ error: 'Method not allowed.' }, 405);
  }
  if (request.method === 'PUT') {
    const expectedOrigin = new URL(backend.auth.options.baseURL as string)
      .origin;
    const origin = request.headers.get('origin');
    const site = request.headers.get('sec-fetch-site');
    // Also permit the explicitly trusted local loopback alias during development.
    const trustedOrigins = backend.auth.options.trustedOrigins as string[];
    if (
      !origin ||
      (origin !== expectedOrigin && !trustedOrigins.includes(origin)) ||
      (site && site !== 'same-origin' && site !== 'none')
    ) {
      return json(
        { error: 'Progress can only be saved from this application.' },
        403,
      );
    }
    if (
      request.headers
        .get('content-type')
        ?.split(';')[0]
        .trim()
        .toLowerCase() !== 'application/json'
    ) {
      return json({ error: 'Progress must be sent as JSON.' }, 415);
    }
  }

  const session = await backend.auth.api.getSession({
    headers: request.headers,
  });
  if (!session) return json({ error: 'Sign in to sync your progress.' }, 401);
  const expectedUserId = request.headers.get('x-lessdumb-user');
  if (expectedUserId && expectedUserId !== session.user.id) {
    return json(
      {
        error:
          'Your account changed. Refresh the session before syncing progress.',
      },
      401,
    );
  }
  if (request.method === 'GET')
    return json(await readState(backend, session.user.id));

  try {
    const { state, revision } = parseStateUpdate(await readJSON(request));
    const result = await writeState(backend, session.user.id, state, revision);
    return json(result.value, result.saved ? 200 : 409);
  } catch (error) {
    if (error instanceof StateValidationError)
      return json({ error: error.message }, error.status);
    throw error;
  }
}
