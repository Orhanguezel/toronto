import { test, expect } from '@playwright/test';

const ADMIN = { email: 'admin@toronto.dev', password: 'admin123' };

test('admin login and save TR translation', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('E‑posta').fill(ADMIN.email);
  await page.getByLabel('Şifre').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Giriş' }).click();
  await page.waitForURL('**/admin');

  await page.goto('/admin/projects');
  await page.getByRole('link', { name: /Edit|Düzenle/ }).first().click();
  await page.getByRole('tab', { name: 'TR' }).click();
  await page.getByLabel('Title').fill('Test Başlık');
  await page.getByRole('button', { name: 'Kaydet' }).click();
  await expect(page.getByText(/Çeviri kaydedildi/i)).toBeVisible();
});