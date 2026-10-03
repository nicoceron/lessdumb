import type { D1Database } from '@cloudflare/workers-types';
import { createMailer, type MailBudget, type Mailer } from './mail';

/** The Cloudflare Email Service `send_email` binding. */
export interface SendEmailBinding {
  send: (message: {
    from: string | { email: string; name: string };
    to: string;
    subject: string;
    html: string;
    text: string;
  }) => Promise<unknown>;
}

export interface MailBindings {
  DB?: D1Database;
  EMAIL?: SendEmailBinding;
  EMAIL_FROM?: string;
}

// Workers Paid includes 3,000 emails a month. 90 a day stays under it in any
// month (31 x 90 = 2,790); one address gets at most 5 a day.
export const DAILY_EMAIL_LIMIT = 90;
export const RECIPIENT_DAILY_EMAIL_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Daily counters in D1 (migration 0003). Every increment is a single atomic
 * upsert, so concurrent isolates cannot exceed the global limit. Recipients
 * are stored as hashes; rows expire after two days.
 */
export function d1MailBudget(
  database: D1Database,
  limits = {
    daily: DAILY_EMAIL_LIMIT,
    recipient: RECIPIENT_DAILY_EMAIL_LIMIT,
  },
  now: () => number = Date.now,
): MailBudget {
  const increment = database.prepare(
    `INSERT INTO email_budget (key, count, expires_at) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count`,
  );
  return {
    async take(recipient) {
      const time = now();
      const day = new Date(time).toISOString().slice(0, 10);
      const expires = Date.parse(day) + 2 * DAY_MS;
      const address = await sha256(recipient.trim().toLowerCase());
      // Check the recipient first so one targeted address cannot use up the
      // global budget for everyone else.
      const perRecipient = await increment
        .bind(`to:${address}:${day}`, expires)
        .first<{ count: number }>();
      if (!perRecipient || perRecipient.count > limits.recipient) return false;
      const [global] = await database.batch<{ count: number }>([
        increment.bind(`all:${day}`, expires),
        database
          .prepare('DELETE FROM email_budget WHERE expires_at < ?')
          .bind(time),
      ]);
      const count = global.results[0]?.count;
      return typeof count === 'number' && count <= limits.daily;
    },
  };
}

/** Mail is on only when both the binding and a valid EMAIL_FROM exist. */
export function workerMailer(bindings: MailBindings): Mailer {
  const binding = bindings.EMAIL;
  return createMailer({
    transport: binding
      ? {
          delivers: true,
          async send({ from, to, subject, html, text }) {
            await binding.send({
              from: from.name
                ? { email: from.email, name: from.name }
                : from.email,
              to,
              subject,
              html,
              text,
            });
          },
        }
      : null,
    from: bindings.EMAIL_FROM,
    budget: bindings.DB ? d1MailBudget(bindings.DB) : undefined,
  });
}
