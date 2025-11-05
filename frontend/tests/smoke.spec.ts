import { test, expect } from '@playwright/test';

test('nav works & home renders', async ({ page }) => {
  await page.goto('/'); // baseURL /tr içerdiği için burası /tr/ olur
  await expect(page).toHaveURL(/\/tr(\/|$)/);
  await expect(page.getByRole('link', { name: 'Satılık Projeler' })).toBeVisible();
});

test('contact form client validation', async ({ page }) => {
  await page.goto('/contact'); // DİKKAT: /tr/contact değil
  await page.getByRole('button', { name: 'Gönder' }).click();
  await expect(page.getByText(/Ad çok kısa|Geçerli bir e-?posta/i)).toBeVisible();
});
