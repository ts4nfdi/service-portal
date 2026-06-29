import {test, expect} from '@playwright/test';
import {acceptTrackingConsent, isImageLoaded} from "@/tests/libs";


const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';


test('site is loaded', async ({page}) => {
    await acceptTrackingConsent(page);
    await page.goto(BASE_URL);
    await expect(page.locator('.site-content').first()).toBeVisible();
});

test("site header is loaded", async ({page}) => {
    /**
     * Test the footer logo and the home tab (as example) is loaded.
     * Home tab has to be active when a user open the site url (default tab)
     */
    await acceptTrackingConsent(page);
    await page.goto(BASE_URL);
    const siteLogo = await isImageLoaded(page, "img[alt='logo']");
    expect(siteLogo).toBe(true);
    await expect(page.locator(".navbar-link-active").first()).toBeVisible();
    await expect(page.locator(".navbar-link-active").first()).toHaveText("Home");
});


test("site header tab change acts correctly", async ({page}) => {
    /**
     * Scenario: user first open the site and sees the Home tab is selected by default.
     * then the user clicks on the Events tab and this should happen:
     * the active tab should change to the Event tab and the site content should change to the
     * Event page.
     */
    await acceptTrackingConsent(page);
    await page.goto(BASE_URL);
    await expect(page.locator(".navbar-link-active").first()).toHaveText("Home");
    await page.getByRole('link', {name: 'Info'}).click();
    await page.getByRole('link', {name: 'Events'}).click();
    await expect(page.locator(".navbar-link-active").first()).toHaveText("Info");
    await expect(page.locator(".site-content").first()).toContainText("Past Events");
});

test("site header selected tab should work on first load", async ({page}) => {
    /**
     * Depends on the selected path, the correct tab should get loaded when
     * a user open it via URL.
     * in this test, the user opens the event page via the url.
     */
    await acceptTrackingConsent(page);
    await page.goto(BASE_URL + "/events");
    await expect(page.locator(".navbar-link-active").first()).toHaveText("Info");
    await expect(page.locator(".site-content").first()).toContainText("Past Events");
});

test("site footer is loaded", async ({page}) => {
    /**
     * Site footers including the logos and footer links has to be loaded.
     */
    await acceptTrackingConsent(page);
    await page.goto(BASE_URL);
    const isBaseLogoLoaded = await isImageLoaded(page, 'img[alt="Base4nfdi Logo"]');
    expect(isBaseLogoLoaded).toBe(true);
    const isDfgLogoLoaded = await isImageLoaded(page, 'img[alt="DFG Logo"]');
    expect(isDfgLogoLoaded).toBe(true);
    await expect(page.locator("footer a[href='/termsofuse']")).toHaveText("Terms of use");
});

