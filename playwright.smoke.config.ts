import { defineConfig } from '@playwright/test';

// Post-deploy smoke test against a live deployment (CI: the production
// Worker). Kept out of the default run: playwright.config.ts only matches
// tests/**/*.spec.ts.
//   LESSDUMB_E2E_URL=https://lessdumb.nicocerond.workers.dev \
//     npx playwright test --config playwright.smoke.config.ts
const baseURL = process.env.LESSDUMB_E2E_URL;
if (!baseURL)
  throw new Error('Set LESSDUMB_E2E_URL to the deployment to smoke-test.');

export default defineConfig({
  testDir: 'tests/smoke',
  testMatch: '**/*.smoke.ts',
  fullyParallel: false,
  workers: 1,
  // One retry absorbs a network blip; every attempt uses and deletes its own account.
  retries: 1,
  timeout: 120_000,
  reporter: 'list',
  use: {
    baseURL,
    // Traces would record the generated password, so keep only screenshots.
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
});
