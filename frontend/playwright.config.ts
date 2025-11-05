// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000/tr',
    trace: 'on-first-retry',
    navigationTimeout: 15_000,
    headless: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // 👇 Bunu ekle
  webServer: {
    command: 'NEXT_PUBLIC_DISABLE_SENTRY=1 next dev -p 3000',
    url: 'http://localhost:3000/tr',
    reuseExistingServer: true,
    stdout: 'pipe',
  },
});
