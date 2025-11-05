import { test, expect } from '@playwright/test';
const selectors = ['h1','h2','p','.btn'];
for (const sel of selectors){
  test(`no overflow for ${sel}`, async ({ page }) => {
    await page.goto('http://localhost:3000/de/');
    const hasOverflow = await page.evaluate((s)=>{
      return [...document.querySelectorAll(s)].some(el=> el.scrollWidth > el.clientWidth + 2);
    }, sel);
    expect(hasOverflow).toBeFalsy();
  });
}