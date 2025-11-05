import { test, expect } from '@playwright/test';

test('detail pages include hreflang links', async ({ page }) => {
  await page.goto('/tr/blog/test-yazi');
  const links = await page.locator('link[rel="alternate"][hreflang]').all();
  expect(links.length).toBeGreaterThan(0);
});