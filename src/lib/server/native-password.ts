import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Better Auth's documented custom password hook, preserving its scrypt format
// and work factors while avoiding the pure-JS fallback in Workers bundles.
const parameters = { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 };
function key(password: string, salt: string) {
  return scryptSync(password.normalize('NFKC'), salt, 64, parameters);
}
export const nativePassword = {
  async hash(password: string) {
    const salt = randomBytes(16).toString('hex');
    return `${salt}:${key(password, salt).toString('hex')}`;
  },
  async verify({ hash, password }: { hash: string; password: string }) {
    const match = /^([a-f0-9]{32}):([a-f0-9]{128})$/.exec(hash);
    if (!match) return false;
    return timingSafeEqual(
      key(password, match[1]),
      Buffer.from(match[2], 'hex'),
    );
  },
};
