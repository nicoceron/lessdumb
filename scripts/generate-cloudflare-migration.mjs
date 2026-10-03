import { mkdir, writeFile } from 'node:fs/promises';
import Database from 'better-sqlite3';
import { getMigrations } from 'better-auth/db/migration';
import { authOptions } from '../src/lib/server/auth-options.ts';

// Generate only the schema from a new in-memory database. No local users,
// sessions, progress, or signing secrets are copied into the deployment.
const database = new Database(':memory:');
try {
  const { runMigrations } = await getMigrations(
    authOptions(
      {
        secret: 'schema-generation-only-at-least-32-characters',
        baseURL: 'http://localhost:4321',
      },
      database,
    ),
  );
  await runMigrations();
  database.exec(`CREATE TABLE learner_state (
    user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
    state_json TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL
  )`);
  const rows = database
    .prepare(
      `SELECT sql FROM sqlite_master
    WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
    ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name`,
    )
    .all();
  await mkdir('migrations', { recursive: true });
  await writeFile(
    'migrations/0001_accounts_and_progress.sql',
    '-- Generated from Better Auth 1.7.7 with scripts/generate-cloudflare-migration.mjs.\n' +
      rows.map((row) => `${row.sql};`).join('\n\n') +
      '\n',
  );
  console.log('Generated the account and learner-state schema.');
} finally {
  database.close();
}
