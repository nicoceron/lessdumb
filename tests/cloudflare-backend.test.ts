import { readFile } from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { d1StateStore } from '../src/lib/server/d1-state-store';
import { nativePassword } from '../src/lib/server/native-password';
import { createState } from '../src/lib/state';

const runtimes: Miniflare[] = [];
afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.dispose()));
});

async function database() {
  const runtime = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: 'export default { fetch() { return new Response("test"); } }',
      d1Databases: { DB: 'lessdumb-test' },
    }),
  );
  runtimes.push(runtime);
  const db = (await runtime.getD1Database('DB')) as unknown as D1Database;
  const migration = (
    await Promise.all(
      ['0001_accounts_and_progress.sql', '0002_compressed_progress.sql'].map(
        (name) => readFile(`migrations/${name}`, 'utf8'),
      ),
    )
  ).join('\n');
  await db.batch(
    migration
      .split(';')
      .map((sql) => sql.trim())
      .filter(Boolean)
      .map((sql) => db.prepare(sql)),
  );
  for (const id of ['first', 'second'])
    await db
      .prepare(
        'INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, 0, 0, 0)',
      )
      .bind(id, id, `${id}@example.test`)
      .run();
  return db;
}

describe('Cloudflare D1 revision and account storage', () => {
  it('keeps independent learner states and rejects a nonexistent account', async () => {
    const store = d1StateStore(await database());
    const first = createState();
    const second = { ...createState(), activeCourseId: 'rust-foundations' };
    expect(await store.read('first')).toEqual({ state: null, revision: 0 });
    expect((await store.write('first', first, 0)).saved).toBe(true);
    expect((await store.write('second', second, 0)).saved).toBe(true);
    expect(await store.read('first')).toEqual({ state: first, revision: 1 });
    expect(await store.read('second')).toEqual({ state: second, revision: 1 });
    await expect(store.write('missing', first, 0)).rejects.toThrow();
  });

  it('reads legacy JSON rows and upgrades them on the next write', async () => {
    const db = await database();
    const state = createState();
    await db
      .prepare(
        'INSERT INTO learner_state (user_id, state_json, revision, updated_at) VALUES (?, ?, 1, 0)',
      )
      .bind('first', JSON.stringify(state))
      .run();
    const store = d1StateStore(db);
    expect(await store.read('first')).toEqual({ state, revision: 1 });
    expect((await store.write('first', state, 1)).saved).toBe(true);
    expect(
      await db
        .prepare('SELECT encoding FROM learner_state WHERE user_id = ?')
        .bind('first')
        .first('encoding'),
    ).toBe('gzip-base64');
    expect(await store.read('first')).toEqual({ state, revision: 2 });
  });

  it('allows exactly one concurrent creation and one writer at the same revision', async () => {
    const store = d1StateStore(await database());
    const states = [
      createState(),
      { ...createState(), activeCourseId: 'cpp-foundations' },
    ];
    const created = await Promise.all(
      states.map((state) => store.write('first', state, 0)),
    );
    expect(created.filter((result) => result.saved)).toHaveLength(1);
    expect(created[0].value).toEqual(created[1].value);
    expect(created[0].value.revision).toBe(1);
    const updated = await Promise.all(
      states.map((state) => store.write('first', state, 1)),
    );
    expect(updated.filter((result) => result.saved)).toHaveLength(1);
    expect(updated[0].value).toEqual(updated[1].value);
    expect(updated[0].value.revision).toBe(2);
    expect(await store.read('first')).toEqual(updated[0].value);
  });

  it('does not insert a missing state with a stale revision or overwrite newer evidence', async () => {
    const store = d1StateStore(await database());
    const state = createState();
    expect(await store.write('first', state, 9)).toEqual({
      saved: false,
      value: { state: null, revision: 0 },
    });
    await store.write('first', state, 0);
    const newer = { ...state, dailyGoal: 80 };
    await store.write('first', newer, 1);
    expect(await store.write('first', state, 1)).toEqual({
      saved: false,
      value: { state: newer, revision: 2 },
    });
    expect(await store.read('first')).toEqual({ state: newer, revision: 2 });
  });
});

describe('native Workers password hashing', () => {
  it('verifies existing Better Auth hashes and normalizes Unicode identically', async () => {
    const hash = await hashPassword('password-\u212b-example');
    expect(
      await nativePassword.verify({
        hash,
        password: 'password-\u00c5-example',
      }),
    ).toBe(true);
    expect(
      await nativePassword.verify({ hash, password: 'wrong-password' }),
    ).toBe(false);
  });

  it('produces standard Better Auth hashes with random salts and rejects malformed values', async () => {
    const hash = await nativePassword.hash('correct-password');
    expect(await verifyPassword({ hash, password: 'correct-password' })).toBe(
      true,
    );
    expect(await nativePassword.hash('correct-password')).not.toBe(hash);
    expect(
      await nativePassword.verify({
        hash: 'invalid',
        password: 'correct-password',
      }),
    ).toBe(false);
  });
});
