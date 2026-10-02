import type { LearnerState } from '../state';
import type { AccountState } from '../account';
import type { Backend } from './backend';

interface StateRow {
  state_json: string;
  revision: number;
}

export function readState(backend: Backend, userId: string): AccountState {
  const row = backend.database
    .prepare('SELECT state_json, revision FROM learner_state WHERE user_id = ?')
    .get(userId) as StateRow | undefined;
  return row
    ? {
        state: JSON.parse(row.state_json) as LearnerState,
        revision: row.revision,
      }
    : { state: null, revision: 0 };
}

/** A transaction makes revision verification and the write a single operation. */
export function writeState(
  backend: Backend,
  userId: string,
  state: LearnerState,
  revision: number,
): { saved: boolean; value: AccountState } {
  return backend.database
    .transaction(() => {
      const current = readState(backend, userId);
      if (current.revision !== revision)
        return { saved: false, value: current };
      const nextRevision = revision + 1;
      backend.database
        .prepare(
          `
      INSERT INTO learner_state (user_id, state_json, revision, updated_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, revision = excluded.revision, updated_at = excluded.updated_at
    `,
        )
        .run(userId, JSON.stringify(state), nextRevision, Date.now());
      return { saved: true, value: { state, revision: nextRevision } };
    })
    .immediate();
}
