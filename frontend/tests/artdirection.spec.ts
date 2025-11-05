import { test, expect } from '@playwright/test';

// tests/artdirection.spec.ts
test('hero renders picture with sources', async ({ page }) => {
  await page.goto('/tr');
  const n = await page.locator('picture source').count();
  expect(n).toBeGreaterThan(0);
});
