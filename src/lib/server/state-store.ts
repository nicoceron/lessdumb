import type { LearnerState } from '../state';
import type { Backend } from './backend-contract';

export async function readState(backend: Backend, userId: string) {
  return backend.states.read(userId);
}

export async function writeState(
  backend: Backend,
  userId: string,
  state: LearnerState,
  revision: number,
) {
  return backend.states.write(userId, state, revision);
}
