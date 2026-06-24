import {Page} from '@playwright/test';

export async function acceptTrackingConsent(page: Page): Promise<void> {
    await page.addInitScript(() => {
        window.localStorage.setItem('matomoIsEnabled', 'true');
    });
}

export async function isImageLoaded(page: Page, selectRule: string): Promise<boolean> {
    return await page.locator(selectRule).evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalWidth > 0;
    });
}
