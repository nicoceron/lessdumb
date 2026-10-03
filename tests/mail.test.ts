import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createMailer,
  isReservedEmailDomain,
  parseSender,
  passwordResetEmail,
  verificationEmail,
  type MailTransport,
} from '../src/lib/server/mail';
import {
  workerMailer,
  type SendEmailBinding,
} from '../src/lib/server/cloudflare-mail';

const quiet = () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() });
const message = {
  to: 'learner@lessdumb-mail.dev',
  subject: 'Subject',
  text: 'Text',
  html: '<p>HTML</p>',
};
afterEach(() => {
  vi.restoreAllMocks();
});

function binding() {
  const sent: Parameters<SendEmailBinding['send']>[0][] = [];
  const send = vi.fn(async (input: (typeof sent)[number]) => {
    sent.push(input);
    return { messageId: 'test' };
  });
  return { sent, send, binding: { send } satisfies SendEmailBinding };
}

describe('reserved recipient domains', () => {
  it.each([
    'smoke+123@example.com',
    'a@EXAMPLE.NET',
    'a@example.org.',
    'a@mail.example.com',
    'a@lessdumb.test',
    'a@anything.invalid',
    'a@localhost',
    'a@app.localhost',
    'a@site.example',
  ])('skips %s', (address) => {
    expect(isReservedEmailDomain(address)).toBe(true);
  });

  it.each([
    'learner@gmail.com',
    'a@example.co',
    'a@notexample.com',
    'a@testing.dev',
    'a@invalid.dev',
  ])('delivers to %s', (address) => {
    expect(isReservedEmailDomain(address)).toBe(false);
  });
});

describe('sender configuration', () => {
  it('reads plain and named senders and rejects anything else', () => {
    expect(parseSender('noreply@lessdumb.dev')).toEqual({
      email: 'noreply@lessdumb.dev',
    });
    expect(parseSender(' lessdumb <noreply@lessdumb.dev> ')).toEqual({
      email: 'noreply@lessdumb.dev',
      name: 'lessdumb',
    });
    expect(parseSender('"Less Dumb" <noreply@lessdumb.dev>')).toEqual({
      email: 'noreply@lessdumb.dev',
      name: 'Less Dumb',
    });
    for (const value of [undefined, '', '   ', 'lessdumb', 'a@b', '<x@y>z'])
      expect(parseSender(value)).toBeNull();
  });
});

describe('disabled mail', () => {
  it('is off without a transport, logs, and never throws', async () => {
    const log = quiet();
    const mailer = createMailer({ from: 'noreply@lessdumb.dev', log });
    expect(mailer.enabled).toBe(false);
    await expect(mailer.sendMail(message)).resolves.toBe('disabled');
    expect(log.info).toHaveBeenCalledWith(
      expect.stringContaining('Email is disabled'),
    );
  });

  it('stays off on Workers without the EMAIL binding or a valid EMAIL_FROM', async () => {
    const { binding: email, send } = binding();
    for (const bindings of [
      {},
      { EMAIL_FROM: 'lessdumb <noreply@lessdumb.dev>' },
      { EMAIL: email },
      { EMAIL: email, EMAIL_FROM: '' },
      { EMAIL: email, EMAIL_FROM: 'not an address' },
    ]) {
      const mailer = workerMailer(bindings);
      expect(mailer.enabled).toBe(false);
      vi.spyOn(console, 'info').mockImplementation(() => {});
      await expect(mailer.sendMail(message)).resolves.toBe('disabled');
    }
    expect(send).not.toHaveBeenCalled();
  });
});

describe('Workers delivery', () => {
  it('sends through the binding with the configured named sender', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const { binding: email, sent } = binding();
    const mailer = workerMailer({
      EMAIL: email,
      EMAIL_FROM: 'lessdumb <noreply@lessdumb.dev>',
    });
    expect(mailer.enabled).toBe(true);
    await expect(mailer.sendMail(message)).resolves.toBe('sent');
    expect(sent).toEqual([
      {
        from: { email: 'noreply@lessdumb.dev', name: 'lessdumb' },
        to: 'learner@lessdumb-mail.dev',
        subject: 'Subject',
        text: 'Text',
        html: '<p>HTML</p>',
      },
    ]);
  });

  it('never delivers to reserved domains such as test and smoke accounts', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const { binding: email, send } = binding();
    const mailer = workerMailer({
      EMAIL: email,
      EMAIL_FROM: 'noreply@lessdumb.dev',
    });
    for (const to of ['smoke+42@example.com', 'learner@lessdumb.test'])
      await expect(mailer.sendMail({ ...message, to })).resolves.toBe(
        'reserved',
      );
    expect(send).not.toHaveBeenCalled();
  });

  it('turns transport failures into a result instead of an exception', async () => {
    const log = quiet();
    const transport: MailTransport = {
      delivers: true,
      send: async () => {
        throw new Error('Sender domain is not verified');
      },
    };
    const mailer = createMailer({
      transport,
      from: 'noreply@lessdumb.dev',
      log,
    });
    await expect(mailer.sendMail(message)).resolves.toBe('failed');
    expect(log.error).toHaveBeenCalled();
  });

  it('holds mail when the budget is spent or cannot be checked', async () => {
    const send = vi.fn(async () => {});
    const transport: MailTransport = { delivers: true, send };
    const spent = createMailer({
      transport,
      from: 'noreply@lessdumb.dev',
      budget: { take: async () => false },
      log: quiet(),
    });
    await expect(spent.sendMail(message)).resolves.toBe('limited');
    const unknown = createMailer({
      transport,
      from: 'noreply@lessdumb.dev',
      budget: {
        take: async () => {
          throw new Error('D1 unavailable');
        },
      },
      log: quiet(),
    });
    await expect(unknown.sendMail(message)).resolves.toBe('limited');
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects malformed recipients', async () => {
    const send = vi.fn(async () => {});
    const mailer = createMailer({
      transport: { delivers: true, send },
      from: 'noreply@lessdumb.dev',
      log: quiet(),
    });
    await expect(mailer.sendMail({ ...message, to: 'nobody' })).resolves.toBe(
      'invalid',
    );
    expect(send).not.toHaveBeenCalled();
  });
});

describe('message content', () => {
  const url =
    'https://lessdumb.dev/api/auth/reset-password/abc?callbackURL=%2Freset-password&x=<y>';

  it('explains the password reset link and its expiry in text and HTML', () => {
    const email = passwordResetEmail(url);
    expect(email.subject).toBe('Reset your lessdumb password');
    expect(email.text).toContain(url);
    expect(email.text).toContain('expires in 1 hour');
    expect(email.text).toContain("If you didn't ask for it");
    expect(email.html).toContain(
      'href="https://lessdumb.dev/api/auth/reset-password/abc?callbackURL=%2Freset-password&amp;x=&lt;y&gt;"',
    );
    expect(email.html).not.toContain('<y>');
  });

  it('explains the verification link and its expiry', () => {
    const email = verificationEmail('https://lessdumb.dev/verify?token=t');
    expect(email.subject).toBe('Verify your email for lessdumb');
    expect(email.text).toContain('https://lessdumb.dev/verify?token=t');
    expect(email.text).toContain('expires in 24 hours');
    expect(email.html).toContain('href="https://lessdumb.dev/verify?token=t"');
  });
});
