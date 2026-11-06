import {Page} from '@playwright/test';
import { encode } from "next-auth/jwt";
import { readFile } from "node:fs/promises";

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

export async function readDownloadJson(downloadPath: string): Promise<unknown> {
    return JSON.parse(await readFile(downloadPath, "utf8"));
}

export async function authenticateTestUser(page: Page, siteUrl: string): Promise<void> {
    const value = await encode({
        secret: "test-secret",
        token: {
            token: "mock-jwt",
            username: "Test Curator",
            orcid: "0000-0002-1825-0097",
            expiration: "2099-01-01T00:00:00.000Z",
            authVersion: "gateway-expiration-v1",
        },
    });
    await page.context().addCookies([{ name: "next-auth.session-token", value, url: siteUrl, httpOnly: true }]);
}
