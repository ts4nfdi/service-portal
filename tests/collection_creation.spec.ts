import { expect, type APIRequestContext, type Page, test, type TestInfo } from "@playwright/test";
import { MOCK_GATEWAY_BASE_URL } from "./mockGateway";
import { acceptTrackingConsent } from "./libs";

const BASE_URL = `http://localhost:${process.env.PLAYWRIGHT_TEST_PORT ?? "3000"}`;
async function openNewCollection(page: Page) {
  await acceptTrackingConsent(page);
  await page.goto(`${BASE_URL}/collection/new`);
  await expect(page.getByText("Define your new collection", { exact: true })).toBeVisible();
}

async function chooseManual(page: Page) {
  await page.getByRole("button", { name: "I want to add terminologies myself" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByPlaceholder("Search terminologies ...")).toBeVisible();
}

async function getCreatedCollection(request: APIRequestContext, label: string) {
  const response = await request.get(`${MOCK_GATEWAY_BASE_URL}/__test__/created-collection?label=${encodeURIComponent(label)}`);
  return response.json();
}

test("creation starts with method choices and preserves the bulk TSS path", async ({ page }) => {
  await openNewCollection(page);

  await expect(page.getByText("A terminology collection groups terminologies for a specific purpose or context.")).toBeVisible();
  await page.getByRole("button", { name: "I want to bulk import terminologies from source(s)" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  await expect(page.getByText("You can import all the terminologies from the selected terminology services.")).toBeVisible();
  await expect(page.getByRole("checkbox").first()).toBeVisible();
  await expect(page.locator(".autocomplete-in-form")).toBeVisible();
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
});

test("manual creation supports local search, provider filtering, clear, and outside close", async ({ page }) => {
  await openNewCollection(page);
  await chooseManual(page);

  const providerButton = page.locator("#provider-filter-button");
  const search = page.getByPlaceholder("Search terminologies ...");
  await providerButton.click();
  await expect(page.getByRole("checkbox", { name: "tib" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "ebi" })).toBeVisible();
  await page.getByRole("checkbox", { name: "tib" }).check();
  await expect(providerButton).toContainText("tib");
  await expect(providerButton).not.toContainText("All providers");
  await page.getByText("Define your new collection", { exact: true }).click();
  await search.fill("gamma");
  await expect(page.getByText("No terminologies found.", { exact: true })).toBeVisible();
  await providerButton.click();
  await page.getByRole("checkbox", { name: "ebi" }).check();
  await expect(providerButton).toContainText("tib and +1");
  await page.getByText("Define your new collection", { exact: true }).click();
  await search.fill("gamma");
  await expect(page.getByText("gamma(ebi)", { exact: true })).toBeVisible();
  await page.getByText("Define your new collection", { exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "tib" })).toBeHidden();

  await providerButton.click();
  await page.getByRole("button", { name: "Clear selection" }).click();
  await expect(providerButton).toContainText("All providers");

  await search.fill("alpha");
  await expect(page.getByText("alpha(tib)", { exact: true })).toBeVisible();
  await page.getByText("Define your new collection", { exact: true }).click();
  await expect(page.getByText("alpha(tib)", { exact: true })).toBeHidden();
  await search.focus();
  await expect(page.getByText("alpha(tib)", { exact: true })).toBeVisible();
  await page.getByText("alpha(tib)", { exact: true }).click();
  await expect(page.getByRole("button", { name: /Remove terminology alpha \(tib\)/ })).toBeVisible();
});

test("manual creation sends the exact provider source", async ({ page, request }, testInfo: TestInfo) => {
  const collectionLabel = `${testInfo.project.name}-manual-provider-source`;
  await openNewCollection(page);
  await chooseManual(page);

  const search = page.getByPlaceholder("Search terminologies ...");
  await search.fill("gamma");
  await page.getByText("gamma(ebi)", { exact: true }).click();
  await search.press("Escape");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  await page.getByLabel("Collection Title").fill(collectionLabel);
  await page.getByLabel("Description").fill("Description for manual test collection");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByText("private", { exact: true })).toHaveClass(/font-semibold/);
  await expect(page.getByText("Public", { exact: true })).not.toHaveClass(/font-semibold/);
  await page.getByLabel("Public").check({ force: true });
  await expect(page.getByText("Public", { exact: true })).toHaveClass(/font-semibold/);
  await expect(page.getByText("private", { exact: true })).not.toHaveClass(/font-semibold/);
  await page.getByRole("button", { name: "Create" }).click();

  await expect.poll(() => getCreatedCollection(request, collectionLabel)).toMatchObject({
    label: collectionLabel,
    description: "Description for manual test collection",
    isPublic: true,
    terminologies: [{ label: "gamma", source: "ebi", uri: "https://example.test/gamma" }],
  });
});

test("manual creation allows zero terminologies and Back resets the method", async ({ page, request }, testInfo: TestInfo) => {
  const collectionLabel = `${testInfo.project.name}-manual-empty`;
  await openNewCollection(page);
  await chooseManual(page);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByLabel("Collection Title")).toBeVisible();
  await page.getByLabel("Collection Title").fill(collectionLabel);
  await page.getByLabel("Description").fill("Collection without initial terminologies");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Create" }).click();
  await expect.poll(() => getCreatedCollection(request, collectionLabel)).toMatchObject({
    label: collectionLabel,
    terminologies: [],
  });

  await page.goto(`${BASE_URL}/collection/new`);
  await chooseManual(page);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByPlaceholder("Search terminologies ...")).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("button", { name: "I want to add terminologies myself" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
});
