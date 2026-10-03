import { randomUUID } from 'node:crypto';
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createMailer, type Mailer, type MailTransport } from './mail';

// The Node server never sends real email. For browser tests it can write each
// message to a local outbox directory. The Cloudflare build never imports this
// module, and Node only honours the flag on a loopback auth origin, so the
// outbox cannot be switched on for a public deployment.
export const TEST_OUTBOX_ENV = 'LESSDUMB_TEST_OUTBOX';
const TEST_SENDER = 'lessdumb <noreply@lessdumb.test>';

export function isLoopbackOrigin(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host === '127.0.0.1' ||
      host === '[::1]'
    );
  } catch {
    return false;
  }
}

export function testOutboxTransport(directory: string): MailTransport {
  return {
    delivers: false,
    async send(message) {
      mkdirSync(directory, { recursive: true });
      const name = `${Date.now()}-${randomUUID()}.json`;
      const temporary = join(directory, `.${name}.tmp`);
      // Rename makes each message appear complete to a polling reader.
      writeFileSync(temporary, JSON.stringify(message, null, 2), {
        mode: 0o600,
      });
      renameSync(temporary, join(directory, name));
    },
  };
}

export function nodeMailer(
  baseURL: string,
  environment: Record<string, string | undefined> = process.env,
): Mailer {
  const directory = environment[TEST_OUTBOX_ENV]?.trim();
  if (!directory) return createMailer({});
  if (!isLoopbackOrigin(baseURL)) {
    console.warn(
      `[mail] ${TEST_OUTBOX_ENV} is ignored: the test outbox only runs on a loopback BETTER_AUTH_URL.`,
    );
    return createMailer({});
  }
  return createMailer({
    transport: testOutboxTransport(resolve(directory)),
    from: TEST_SENDER,
  });
}
