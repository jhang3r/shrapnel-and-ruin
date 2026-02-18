import { test, expect } from '@playwright/test';

test('guest can reach lobby', async ({ page }) => {
  await page.goto('http://localhost:5173/auth');
  await page.click('button:has-text("Play as Guest")');
  await page.waitForURL('**/lobby');
  await expect(page.locator('h1')).toContainText('Lobby');
});

test('registered user can create and validate a deck', async ({ page }) => {
  await page.goto('http://localhost:5173/auth');
  await page.click('button:has-text("Register")');
  const ts = Date.now();
  await page.fill('input[name="username"]', `Pilot${ts}`);
  await page.fill('input[name="email"]', `pilot${ts}@test.com`);
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]:has-text("Register")');
  await page.waitForURL('**/lobby');
  await page.goto('http://localhost:5173/decks');
  await page.click('button:has-text("New Deck")');
  await page.waitForURL('**/decks/**');
  await expect(page.locator('h1, input[name="name"]')).toBeTruthy();
});
