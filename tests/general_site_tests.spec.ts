import {test, expect} from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';


test('site is loaded', async ({page}) => {
    await page.goto(BASE_URL);
    await expect(page.locator('.site-content').first()).toBeVisible();
});

test("site header is loaded", async ({page}) => {
    /**
     * Test the footer logo and the home tab (as example) is loaded.
     * Home tab has to be active when a user open the site url (default tab)
     */
    await page.goto(BASE_URL);
    await expect(page.locator("img[alt='logo']").first()).toBeVisible();
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
    await page.goto(BASE_URL);

})



