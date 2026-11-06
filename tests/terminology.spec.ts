import { expect, type Page, test } from "@playwright/test";
import { MOCK_COLLECTIONS } from "./fixtures/collections";
import { acceptTrackingConsent, authenticateTestUser } from "./libs";
import { MOCK_GATEWAY_BASE_URL } from "./mockGateway";

const BASE_URL = `http://localhost:${process.env.PLAYWRIGHT_TEST_PORT ?? "3000"}`;
const option = { terminologyId: "cached", providerId: "tib", description: "Cached terminology", uri: "https://example.test/cached" };

async function openCreation(page: Page) {
  await acceptTrackingConsent(page);
  await authenticateTestUser(page, BASE_URL);
  await page.goto(`${BASE_URL}/collection/new`);
  await expect(page.getByRole("button", { name: "I want to add terminologies myself" })).toBeVisible();
}

async function submitCollection(page: Page, label: string) {
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.locator("#collection-title").fill(label);
  await page.getByLabel("Description", { exact: true }).fill("Terminology regression test");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Create", exact: true }).click({ noWaitAfter: true });
}

test("terminology endpoint maps upstream fields to the internal terminology schema", async ({ request }) => {
  const response = await request.get(`${BASE_URL}/api/terminology-options`);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual([
    { terminologyId: "alpha", providerId: "tib", description: "Alpha terminology", uri: "https://example.test/alpha" },
    { terminologyId: "beta", providerId: "tib", description: "", uri: "https://example.test/beta" },
    { terminologyId: "gamma", providerId: "ebi", description: "Gamma terminology", uri: "https://example.test/gamma" },
  ]);
});

test("terminology cache persists across reload", async ({ page }) => {
  let requests = 0;
  page.on("request", (request) => { if (new URL(request.url()).pathname === "/api/terminology-options") requests += 1; });
  await acceptTrackingConsent(page);
  await page.goto(BASE_URL);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("terminology-options-v1") ?? "null")?.options?.[0]?.terminologyId)).toBe("alpha");
  expect(requests).toBe(1);
  await page.reload();
  await expect(page.locator(".site-content").first()).toBeVisible();
  expect(requests).toBe(1);
});

test("fresh terminology cache supplies selection without a network request", async ({ page }) => {
  await page.addInitScript((cachedOption) => localStorage.setItem("terminology-options-v1", JSON.stringify({ fetchedAt: Date.now(), options: [cachedOption] })), option);
  let requests = 0;
  await page.route("**/api/terminology-options", (route) => { requests += 1; return route.abort(); });
  await openCreation(page);
  await page.getByRole("button", { name: "I want to add terminologies myself" }).click();
  await page.getByPlaceholder("Search terminologies ...").fill("cached");
  await expect(page.getByText("cached(tib)", { exact: true })).toBeVisible();
  expect(requests).toBe(0);
});

test("expired terminology cache is refreshed before selection", async ({ page }) => {
  await page.addInitScript((cachedOption) => localStorage.setItem("terminology-options-v1", JSON.stringify({ fetchedAt: Date.now() - 25 * 60 * 60 * 1000, options: [cachedOption] })), option);
  await openCreation(page);
  await page.getByRole("button", { name: "I want to add terminologies myself" }).click();
  await page.getByPlaceholder("Search terminologies ...").fill("gamma");
  await expect(page.getByText("gamma(ebi)", { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("terminology-options-v1") ?? "null")?.options?.[0]?.terminologyId)).toBe("alpha");
});

test("failed terminology load displays retry and recovers", async ({ page }) => {
  await page.route("**/api/terminology-options", (route) => route.fulfill({ status: 502, contentType: "application/json", body: "null" }));
  await openCreation(page);
  await page.getByRole("button", { name: "I want to add terminologies myself" }).click();
  await expect(page.getByText("Terminologies could not be loaded.", { exact: true })).toBeVisible();
  await page.unroute("**/api/terminology-options");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await page.getByPlaceholder("Search terminologies ...").fill("alpha");
  await expect(page.getByText("alpha(tib)", { exact: true })).toBeVisible();
});

test("manual selection submits the original terminology label, provider and URI", async ({ page, request }) => {
  await openCreation(page);
  await page.getByRole("button", { name: "I want to add terminologies myself" }).click();
  await page.getByPlaceholder("Search terminologies ...").fill("gamma");
  await page.getByText("gamma(ebi)", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove terminology gamma (ebi)" })).toBeVisible();
  await page.getByText("Define your new collection", { exact: true }).click();
  await submitCollection(page, "terminology-manual-regression");
  await expect.poll(async () => (await request.get(`${MOCK_GATEWAY_BASE_URL}/__test__/created-collection?label=terminology-manual-regression`)).json()).toMatchObject({
    label: "terminology-manual-regression",
    terminologies: [{ label: "gamma", source: "ebi", uri: "https://example.test/gamma", type: "DATABASE" }],
  });
});

test("bulk provider selection and search preserve the submitted terminology set", async ({ page, request }) => {
  await openCreation(page);
  await page.getByRole("button", { name: "I want to bulk import terminologies from source(s)" }).click();
  await page.getByRole("checkbox", { name: /^tib\b/ }).check();
  await page.getByRole("checkbox", { name: /^ebi\b/ }).check();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByPlaceholder("Search terminologies ...").fill("beta");
  await page.getByRole("checkbox", { name: "beta (tib)", exact: true }).uncheck();
  await page.getByPlaceholder("Search terminologies ...").fill("");
  await expect(page.getByText("2 of 3 terminologies selected", { exact: true })).toBeVisible();
  await submitCollection(page, "terminology-bulk-regression");
  await expect.poll(async () => (await request.get(`${MOCK_GATEWAY_BASE_URL}/__test__/created-collection?label=terminology-bulk-regression`)).json()).toMatchObject({
    label: "terminology-bulk-regression",
    terminologies: [
      { label: "alpha", source: "tib", uri: "https://example.test/alpha", type: "DATABASE" },
      { label: "gamma", source: "ebi", uri: "https://example.test/gamma", type: "DATABASE" },
    ],
  });
});

for (const locale of ["en", "de"] as const) {
  test(`${locale} collection uses localized terminology labels and keeps the info modal functional`, async ({ page }) => {
    await acceptTrackingConsent(page);
    await page.route("https://api.terminology.tib.eu/**", (route) => route.fulfill({ json: { ontologyId: "envo", config: { title: "ENVO", description: "Test terminology" }, status: "LOADED" } }));
    await page.goto(`${BASE_URL}${locale === "de" ? "/de" : ""}/collection/${MOCK_COLLECTIONS[0].id}`);
    await expect(page.getByRole("columnheader", { name: locale === "de" ? "Terminologie-ID" : "Terminology ID", exact: true })).toBeVisible();
    const button = page.getByRole("button", { name: `${locale === "de" ? "Terminologieinformationen anzeigen für" : "Show terminology information for"} ENVO`, exact: true });
    await expect(button).toBeVisible();
    await button.click();
    const modal = page.locator('[id^="terminology-info-"]:not(.hidden)');
    await expect(modal).toBeVisible();
    await expect(modal.locator(".terminology-info-widget")).toBeVisible();
    await modal.locator("button[data-modal-hide]").click();
    await expect(modal).toBeHidden();
  });
}
