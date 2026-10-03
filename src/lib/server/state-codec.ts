import type { LearnerState } from '../state';
import { StateValidationError } from './state-validation';

export async function encodeState(state: LearnerState): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new CompressionStream('gzip'));
  const compressed = await new Response(stream).arrayBuffer();
  const source = Buffer.from(compressed).toString('base64');
  if (source.length > 1_900_000)
    throw new StateValidationError(
      'Progress backup exceeds the database storage limit.',
      413,
    );
  return source;
}

export async function decodeState(
  source: string,
  encoding = 'json',
): Promise<LearnerState> {
  if (encoding === 'json') return JSON.parse(source) as LearnerState;
  if (encoding !== 'gzip-base64')
    throw new Error('Unsupported stored progress encoding.');
  const bytes = Buffer.from(source, 'base64');
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return JSON.parse(await new Response(stream).text()) as LearnerState;
}
