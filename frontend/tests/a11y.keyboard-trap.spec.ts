import { test, expect } from '@playwright/test';

type Page = import('@playwright/test').Page;

async function tabThrough(page: Page, limit=150){
  const visited = new Set<string>();
  for(let i=0;i<limit;i++){
    await page.keyboard.press('Tab');
    const el = await page.evaluate(()=> document.activeElement?.outerHTML?.slice(0,120) || 'none');
    if (visited.has(el)) throw new Error('Focus trap suspected');
    visited.add(el);
  }
}

test('no keyboard trap on key pages', async ({ page }) => {
  for (const path of ['/', '/tr/projects', '/tr/contact', '/admin']){
    await page.goto('https://localhost:3000'+path);
    await tabThrough(page);
    await page.keyboard.down('Shift');
    await tabThrough(page);
    await page.keyboard.up('Shift');
  }
});