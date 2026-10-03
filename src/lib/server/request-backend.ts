// The Cloudflare build resolves this entry to cloudflare-backend.ts. Local Node
// development retains its persistent SQLite database and signing secret.
export { emailEnabled, getBackend } from './backend';
