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
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await expect(page.getByPlaceholder("Search terminologies ...")).toBeVisible();
}

async function getCreatedCollection(request: APIRequestContext, label: string) {
  const response = await request.get(`${MOCK_GATEWAY_BASE_URL}/__test__/created-collection?label=${encodeURIComponent(label)}`);
  return response.json();
}

test("creation starts with method choices and enters bulk provider selection", async ({ page }) => {
  await openNewCollection(page);

  await expect(page.getByText("A terminology collection groups terminologies for a specific purpose or context.")).toBeVisible();
  await page.getByRole("button", { name: "I want to bulk import terminologies from source(s)" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
  await expect(page.getByText("Select providers", { exact: true })).toBeVisible();
  await expect(page.getByText("Select one or more providers to import terminologies from. The count shows how many terminologies each provider offers.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
});

test("bulk creation selects providers, filters the terminology table, and submits selected records", async ({ page, request }, testInfo: TestInfo) => {
  const collectionLabel = `${testInfo.project.name}-bulk-selection`;
  await openNewCollection(page);
  await page.getByRole("button", { name: "I want to bulk import terminologies from source(s)" }).click();

  const next = page.getByRole("button", { name: "Next", exact: true });
  await expect(next).toBeDisabled();
  await expect(page.getByText("tib", { exact: true })).toBeVisible();
  await expect(page.getByText("2 terminologies", { exact: true })).toBeVisible();
  await expect(page.getByText("Terminologies spanning science, engineering, architecture, and technology.", { exact: true })).toBeVisible();
  await expect(page.getByText("ebi", { exact: true })).toBeVisible();
  await expect(page.getByText("1 terminology", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "tib" }).check();
  await page.getByRole("checkbox", { name: "ebi" }).check();
  await expect(next).toBeEnabled();
  await next.click();

  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
  const table = page.getByRole("table");
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(page.getByText("3 of 3 terminologies selected", { exact: true })).toBeVisible();
  await expect(table.getByRole("checkbox", { name: "alpha (tib)" })).toBeChecked();
  await expect(table.getByRole("checkbox", { name: "beta (tib)" })).toBeChecked();
  await expect(table.getByRole("checkbox", { name: "gamma (ebi)" })).toBeChecked();

  const terminologySearch = page.getByPlaceholder("Search terminologies ...");
  await terminologySearch.fill("beta");
  await table.getByRole("checkbox", { name: "beta (tib)" }).uncheck();
  await expect(page.getByText("2 of 3 terminologies selected", { exact: true })).toBeVisible();
  await terminologySearch.fill("alpha");
  const selectAll = table.getByRole("checkbox", { name: "Select or clear all matching terminologies" });
  await selectAll.uncheck();
  await expect(page.getByText("1 of 3 terminologies selected", { exact: true })).toBeVisible();
  await selectAll.check();
  await expect(page.getByText("2 of 3 terminologies selected", { exact: true })).toBeVisible();
  await terminologySearch.fill("");
  await next.click();

  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "80");
  await page.getByLabel("Collection Title").fill(collectionLabel);
  await page.getByLabel("Description").fill("Bulk collection description");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await expect(page.getByText("private", { exact: true })).toHaveClass(/font-semibold/);
  await page.getByRole("button", { name: "Create" }).click();

  await expect.poll(async () => {
    const collection = await getCreatedCollection(request, collectionLabel);
    return collection?.terminologies?.length ?? 0;
  }).toBe(2);
  const createdCollection = await getCreatedCollection(request, collectionLabel);
  expect(createdCollection).toMatchObject({
    label: collectionLabel,
    description: "Bulk collection description",
    isPublic: false,
  });
  expect(createdCollection.terminologies).toEqual(expect.arrayContaining([
    { label: "alpha", source: "tib", uri: "https://example.test/alpha", type: "DATABASE" },
    { label: "gamma", source: "ebi", uri: "https://example.test/gamma", type: "DATABASE" },
  ]));
});

test("manual creation supports local search, provider filtering, clear, and outside close", async ({ page }) => {
  await openNewCollection(page);
  await chooseManual(page);

  const providerButton = page.locator("#provider-filter-button");
  const search = page.getByPlaceholder("Search terminologies ...");
  await providerButton.click();
  await expect(page.getByRole("checkbox", { name: "tib" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "ebi" })).toBeVisible();
  await expect(page.getByText("Terminologies spanning science, engineering, architecture, and technology.")).toBeVisible();
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
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
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
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "20");
});
