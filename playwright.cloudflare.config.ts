import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4333';

export default defineConfig({
  ...base,
  use: { ...base.use, baseURL },
  webServer: {
    command: 'npm run preview:cloudflare -- --ignore-lock',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
  },
});
