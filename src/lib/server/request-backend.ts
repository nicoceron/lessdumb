// The Cloudflare build resolves this entry to cloudflare-backend.ts. Local Node
// development retains its persistent SQLite database and signing secret.
export { getBackend } from './backend';
