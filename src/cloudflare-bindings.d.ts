// Bindings are configured in wrangler.jsonc. Keep the Worker-only import scoped
// so its runtime globals do not replace DOM/Node types in this hybrid project.
declare module 'cloudflare:workers' {
  export const env: {
    DB: import('@cloudflare/workers-types').D1Database;
    BETTER_AUTH_URL: string;
    BETTER_AUTH_SECRET: string;
    /** Optional Email Service binding; mail stays off without it. */
    EMAIL?: import('./lib/server/cloudflare-mail').SendEmailBinding;
    EMAIL_FROM?: string;
  };
}
