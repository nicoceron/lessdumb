import type Database from 'better-sqlite3';
import type { AccountState } from '../account';
import type { LearnerState } from '../state';
import type { StateStore } from './backend-contract';

export function sqliteStateStore(database: Database.Database): StateStore {
  function read(userId: string): AccountState {
    const row = database
      .prepare(
        'SELECT state_json, revision FROM learner_state WHERE user_id = ?',
      )
      .get(userId) as { state_json: string; revision: number } | undefined;
    return row
      ? {
          state: JSON.parse(row.state_json) as LearnerState,
          revision: row.revision,
        }
      : { state: null, revision: 0 };
  }
  return {
    read,
    remove(userId) {
      database
        .prepare('DELETE FROM learner_state WHERE user_id = ?')
        .run(userId);
    },
    write(userId, state, revision) {
      return database
        .transaction(() => {
          const current = read(userId);
          if (current.revision !== revision)
            return { saved: false, value: current };
          const nextRevision = revision + 1;
          database
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
    },
  };
}
