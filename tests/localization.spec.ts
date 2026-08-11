import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { acceptTrackingConsent } from '@/tests/libs';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function gotoPath(page: Page, path = '/') {
  await page.goto(new URL(path, BASE_URL).toString(), {
    waitUntil: 'domcontentloaded',
  });
}

async function expectLocale(page: Page, path: string, lang: 'en' | 'de') {
  await expect(page).toHaveURL(new URL(path, BASE_URL).toString());
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
}

async function openLanguageMenu(page: Page) {
  const button = page.getByRole('button', { name: /select language|sprache auswahlen|sprache auswählen/i });
  const deutschLink = page.locator('a[aria-label="Deutsch"]');
  await expect(button).toBeVisible();

  for (let attempt = 0; attempt < 3 && !(await deutschLink.isVisible()); attempt += 1) {
    await button.click();
    await deutschLink.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
  }

  await expect(deutschLink).toBeVisible();
  await expect(page.locator('a[aria-label="English"]')).toBeVisible();
}

async function switchLanguage(page: Page, label: 'Deutsch' | 'English', path: string) {
  await page.locator(`a[aria-label="${label}"]`).click();
  await expectLocale(page, path, label === 'Deutsch' ? 'de' : 'en');
}

test('root page loads English at the root URL', async ({ page }) => {
  await acceptTrackingConsent(page);
  await gotoPath(page);

  await expectLocale(page, '/', 'en');
});

test('German root URL loads German locale', async ({ page }) => {
  await acceptTrackingConsent(page);
  await gotoPath(page, '/de');

  await expectLocale(page, '/de', 'de');
});

test('language switcher uses flag-only links with accessible language labels', async ({ page }) => {
  await acceptTrackingConsent(page);
  await gotoPath(page);

  await openLanguageMenu(page);

  await expect(page.locator('a[aria-label="English"]')).toHaveText('🇬🇧');
  await expect(page.locator('a[aria-label="Deutsch"]')).toHaveText('🇩🇪');
});

test('language switcher changes root between English and German URLs', async ({ page }) => {
  await acceptTrackingConsent(page);
  await gotoPath(page);

  await openLanguageMenu(page);
  await switchLanguage(page, 'Deutsch', '/de');

  await openLanguageMenu(page);
  await switchLanguage(page, 'English', '/');
});

test('language switcher preserves provider path when changing to German', async ({ page }) => {
  await acceptTrackingConsent(page);
  await gotoPath(page, '/provider');

  await openLanguageMenu(page);
  await switchLanguage(page, 'Deutsch', '/de/provider');
});

test('German provider URL loads German locale directly', async ({ page }) => {
  await acceptTrackingConsent(page);
  await gotoPath(page, '/de/provider');

  await expectLocale(page, '/de/provider', 'de');
});

test('internal links keep the German URL prefix', async ({ page }) => {
  await acceptTrackingConsent(page);
  await gotoPath(page, '/de');

  await page.locator('a.navbar-links[href="/de/collection"]').click();

  await expectLocale(page, '/de/collection', 'de');
});
