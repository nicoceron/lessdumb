import type { D1Database } from '@cloudflare/workers-types';
import type { AccountState } from '../account';
import type { StateStore } from './backend-contract';
import { encodeState, decodeState } from './state-codec';

interface Row {
  state_json: string;
  revision: number;
  encoding?: string;
}
async function accountState(row?: Row | null): Promise<AccountState> {
  return row
    ? {
        state: await decodeState(row.state_json, row.encoding),
        revision: row.revision,
      }
    : { state: null, revision: 0 };
}

export function d1StateStore(database: D1Database): StateStore {
  const select =
    'SELECT state_json, revision, encoding FROM learner_state WHERE user_id = ?';
  return {
    async read(userId) {
      return accountState(
        await database.prepare(select).bind(userId).first<Row>(),
      );
    },
    async remove(userId) {
      await database
        .prepare('DELETE FROM learner_state WHERE user_id = ?')
        .bind(userId)
        .run();
    },
    async write(userId, state, revision) {
      const source = await encodeState(state);
      // Each mutation checks its revision atomically. D1 batch is a transaction:
      // the conflict response observes the same state as the attempted write.
      const mutation =
        revision === 0
          ? database
              .prepare(
                `INSERT INTO learner_state (user_id, state_json, revision, updated_at, encoding)
            VALUES (?, ?, 1, ?, 'gzip-base64') ON CONFLICT(user_id) DO NOTHING`,
              )
              .bind(userId, source, Date.now())
          : database
              .prepare(
                `UPDATE learner_state SET state_json = ?, encoding = 'gzip-base64', revision = revision + 1, updated_at = ?
            WHERE user_id = ? AND revision = ?`,
              )
              .bind(source, Date.now(), userId, revision);
      const [write, read] = await database.batch<Row>([
        mutation,
        database.prepare(select).bind(userId),
      ]);
      return {
        saved: write.meta.changes === 1,
        value: await accountState(read.results[0]),
      };
    },
  };
}
