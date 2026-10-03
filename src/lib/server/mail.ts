// Account email (password reset and verification). Mail is optional: without a
// transport and a sender it stays disabled, and sending never throws, so sign-up
// and reset requests never fail because of email.

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface MailAddress {
  email: string;
  name?: string;
}

export interface OutgoingMail extends MailMessage {
  from: MailAddress;
}

export interface MailTransport {
  /**
   * True when messages reach real inboxes. Reserved domains and the send
   * budget only apply to delivering transports; a test outbox records all.
   */
  delivers: boolean;
  send: (message: OutgoingMail) => Promise<void>;
}

/** Caps real deliveries so abuse cannot drain the monthly email quota. */
export interface MailBudget {
  take: (recipient: string) => Promise<boolean>;
}

export type MailResult =
  'sent' | 'disabled' | 'invalid' | 'reserved' | 'limited' | 'failed';

export interface Mailer {
  enabled: boolean;
  sendMail: (message: MailMessage) => Promise<MailResult>;
}

interface MailLog {
  info: (...values: unknown[]) => void;
  warn: (...values: unknown[]) => void;
  error: (...values: unknown[]) => void;
}

export const RESET_PASSWORD_TOKEN_SECONDS = 60 * 60;
export const VERIFY_EMAIL_TOKEN_SECONDS = 60 * 60 * 24;

const ADDRESS = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

// RFC 2606 and RFC 6761 names never belong to a real mailbox. Sending to them
// would only bounce, so tests and smoke accounts can use them freely.
const RESERVED_DOMAINS = ['example.com', 'example.net', 'example.org'];
const RESERVED_TLDS = ['test', 'example', 'invalid', 'localhost'];

export function emailDomain(address: string): string {
  return address
    .slice(address.lastIndexOf('@') + 1)
    .trim()
    .toLowerCase()
    .replace(/\.$/, '');
}

export function isReservedEmailDomain(address: string): boolean {
  const domain = emailDomain(address);
  const tld = domain.slice(domain.lastIndexOf('.') + 1);
  return (
    RESERVED_TLDS.includes(tld) ||
    RESERVED_DOMAINS.some(
      (reserved) => domain === reserved || domain.endsWith(`.${reserved}`),
    )
  );
}

/** Accepts `noreply@domain` or `Name <noreply@domain>`. */
export function parseSender(value: string | undefined): MailAddress | null {
  const source = value?.trim();
  if (!source) return null;
  const named = /^(.*?)\s*<([^<>]+)>$/.exec(source);
  const email = (named ? named[2] : source).trim();
  if (!ADDRESS.test(email)) return null;
  const name = named?.[1].trim().replace(/^"(.*)"$/, '$1');
  return name ? { email, name } : { email };
}

export function createMailer({
  transport,
  from,
  budget,
  log = console,
}: {
  transport?: MailTransport | null;
  from?: string;
  budget?: MailBudget;
  log?: MailLog;
}): Mailer {
  const sender = parseSender(from);
  const enabled = !!transport && !!sender;
  return {
    enabled,
    async sendMail(message) {
      if (!transport || !sender) {
        log.info(`[mail] Email is disabled; "${message.subject}" not sent.`);
        return 'disabled';
      }
      const to = message.to.trim();
      if (!ADDRESS.test(to)) {
        log.warn('[mail] Skipped a message with an invalid recipient.');
        return 'invalid';
      }
      // Logs name the domain only, never the full address.
      const domain = emailDomain(to);
      if (transport.delivers && isReservedEmailDomain(to)) {
        log.info(`[mail] Skipped "${message.subject}" to reserved ${domain}.`);
        return 'reserved';
      }
      if (transport.delivers && budget) {
        let allowed = false;
        try {
          allowed = await budget.take(to);
        } catch (error) {
          // Fail closed: an unknown budget must not risk the quota.
          log.error('[mail] Could not check the email budget.', error);
        }
        if (!allowed) {
          log.warn(`[mail] Email budget reached; "${message.subject}" held.`);
          return 'limited';
        }
      }
      try {
        await transport.send({ ...message, to, from: sender });
        log.info(`[mail] Sent "${message.subject}" to ${domain}.`);
        return 'sent';
      } catch (error) {
        log.error(`[mail] Could not send "${message.subject}".`, error);
        return 'failed';
      }
    },
  };
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  );
}

function hours(seconds: number): string {
  const value = Math.round(seconds / 3600);
  return value === 1 ? '1 hour' : `${value} hours`;
}

function compose(
  subject: string,
  intro: string,
  action: string,
  url: string,
  outro: string,
): Omit<MailMessage, 'to'> {
  return {
    subject,
    text: `${intro}\n\n${action}: ${url}\n\n${outro}\n\nlessdumb\n`,
    html: `<!doctype html><html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1f2937;"><p>${escapeHtml(intro)}</p><p><a href="${escapeHtml(url)}">${escapeHtml(action)}</a></p><p style="color: #6b7280;">${escapeHtml(outro)}</p><p>lessdumb</p></body></html>`,
  };
}

export function passwordResetEmail(url: string): Omit<MailMessage, 'to'> {
  return compose(
    'Reset your lessdumb password',
    'Someone asked to reset the password for your lessdumb account.',
    'Choose a new password',
    url,
    `This link works once and expires in ${hours(RESET_PASSWORD_TOKEN_SECONDS)}. If you didn't ask for it, ignore this email and your password stays the same.`,
  );
}

export function verificationEmail(url: string): Omit<MailMessage, 'to'> {
  return compose(
    'Verify your email for lessdumb',
    'Confirm that this is the email address for your lessdumb account.',
    'Verify your email',
    url,
    `This link expires in ${hours(VERIFY_EMAIL_TOKEN_SECONDS)}. If you didn't create a lessdumb account, ignore this email.`,
  );
}
