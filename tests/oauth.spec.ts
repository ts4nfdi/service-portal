import { expect, test } from "@playwright/test";
import { acceptTrackingConsent } from "@/tests/libs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

test("OAuth login signs the user in and clears the authorization code", async ({ page }) => {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/api/sso/login`);

  await expect(page).toHaveURL(BASE_URL + "/", { timeout: 15000 });
  await page.locator("#user-menu-button").click();
  await expect(page.locator("#user-dropdown")).toContainText("OAuth User");
  await expect(page.locator("#login-form")).toHaveCount(0);
});
