import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { acceptTrackingConsent } from '@/tests/libs';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function expectLocale(page: Page, path: string, lang: 'en' | 'de') {
  await expect(page).toHaveURL(new URL(path, BASE_URL).toString());
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
}

async function openLanguageMenu(page: Page) {
  await page.getByRole('button', { name: /select language|sprache auswahlen|sprache auswählen/i }).click();
}

test('root page loads English at the root URL', async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(BASE_URL);

  await expectLocale(page, '/', 'en');
});

test('German root URL loads German locale', async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/de`);

  await expectLocale(page, '/de', 'de');
});

test('language switcher uses flag-only links with accessible language labels', async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(BASE_URL);

  await openLanguageMenu(page);

  await expect(page.getByRole('link', { name: 'English' })).toHaveText('🇬🇧');
  await expect(page.getByRole('link', { name: 'Deutsch' })).toHaveText('🇩🇪');
});

test('language switcher changes root between English and German URLs', async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(BASE_URL);

  await openLanguageMenu(page);
  await page.getByRole('link', { name: 'Deutsch' }).click();
  await expectLocale(page, '/de', 'de');
  await page.waitForLoadState('networkidle');

  await openLanguageMenu(page);
  await page.locator('a[aria-label="English"]').click();
  await expectLocale(page, '/', 'en');
});

test('language switcher preserves provider path when changing to German', async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/provider`);

  await openLanguageMenu(page);
  await page.getByRole('link', { name: 'Deutsch' }).click();

  await expectLocale(page, '/de/provider', 'de');
});

test('German provider URL loads German locale directly', async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/de/provider`);

  await expectLocale(page, '/de/provider', 'de');
});

test('internal links keep the German URL prefix', async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/de`);

  await page.locator('a.navbar-links[href="/de/collection"]').click();

  await expectLocale(page, '/de/collection', 'de');
});
