import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home is accessible', async ({ page }) => {
  await page.goto('https://localhost:3000/');
  const results = await new AxeBuilder({ page }).include('main').analyze();
  expect(results.violations).toEqual([]);
});