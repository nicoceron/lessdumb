import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'tests/**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
});
