import { test, expect } from '@playwright/test';
const P = ['/projects/alpha','/services/web','/'];
const LOCALES = ['tr','de','en'];
for (const path of P){
  test(`hreflang ${path}`, async ({ page }) => {
    await page.goto('http://localhost:3000/tr'+path);
    for (const L of LOCALES){
      const href = await page.locator(`link[rel="alternate"][hreflang="${L}"]`).getAttribute('href');
      expect(href).toContain(`/${L}${path}`);
    }
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain(`/tr${path}`); // dil bazlı canonical
  });
}