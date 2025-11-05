import { test, expect } from '@playwright/test';

test('typeahead returns projects and blog', async ({ page }) => {
  await page.goto('/tr/search');
  await page.getByPlaceholder('Arayın…').fill('site');
  await expect(page.getByRole('link', { name: /Blog|Projeler/i })).toBeVisible();
});