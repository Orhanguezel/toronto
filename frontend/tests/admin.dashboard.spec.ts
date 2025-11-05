import { test, expect } from '@playwright/test';

test('dashboard counters render', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByText('Projects')).toBeVisible();
  await expect(page.getByText('Published')).toBeVisible();
});